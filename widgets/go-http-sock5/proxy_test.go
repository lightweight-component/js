package main

import (
	"encoding/base64"
	"io"
	"log"
	"net"
	"net/http"
	"net/http/httptest"
	"testing"
)

type roundTripperFunc func(*http.Request) (*http.Response, error)

func (fn roundTripperFunc) RoundTrip(request *http.Request) (*http.Response, error) {
	return fn(request)
}

func testProxy(username, password string) *Proxy {
	return NewProxy("127.0.0.1:1", username, password, false, log.New(io.Discard, "", 0))
}

func setProxyAuth(request *http.Request, username, password string) {
	request.Header.Set("Proxy-Authorization", "Basic "+base64.StdEncoding.EncodeToString([]byte(username+":"+password)))
}

func TestValidateTLSFiles(t *testing.T) {
	for _, test := range []struct {
		cert, key string
		wantErr   bool
	}{
		{"", "", false},
		{"proxy.pem", "proxy.key", false},
		{"proxy.pem", "", true},
		{"", "proxy.key", true},
	} {
		err := validateTLSFiles(test.cert, test.key)
		if (err != nil) != test.wantErr {
			t.Fatalf("validateTLSFiles(%q, %q) error = %v, want error: %v", test.cert, test.key, err, test.wantErr)
		}
	}
}

func TestSOCKS5ConnectSendsDomainName(t *testing.T) {
	client, server := net.Pipe()
	defer client.Close()
	defer server.Close()
	done := make(chan error, 1)
	go func() {
		greeting := make([]byte, 3)
		if _, err := io.ReadFull(server, greeting); err != nil {
			done <- err
			return
		}
		if string(greeting) != "\x05\x01\x00" {
			t.Errorf("unexpected greeting: %v", greeting)
		}
		if _, err := server.Write([]byte{5, 0}); err != nil {
			done <- err
			return
		}
		header := make([]byte, 5)
		if _, err := io.ReadFull(server, header); err != nil {
			done <- err
			return
		}
		if header[0] != 5 || header[1] != 1 || header[2] != 0 || header[3] != 3 || int(header[4]) != len("api.openai.com") {
			t.Errorf("expected a SOCKS5 domain-name request, got %v", header)
		}
		name := make([]byte, int(header[4])+2)
		if _, err := io.ReadFull(server, name); err != nil {
			done <- err
			return
		}
		if string(name[:len(name)-2]) != "api.openai.com" {
			t.Errorf("unexpected target name: %q", name[:len(name)-2])
		}
		_, err := server.Write([]byte{5, 0, 0, 1, 0, 0, 0, 0, 0, 0})
		done <- err
	}()
	if err := socks5Connect(client, "api.openai.com:443"); err != nil {
		t.Fatal(err)
	}
	if err := <-done; err != nil {
		t.Fatal(err)
	}
}

func TestOutboundRequestRemovesProxyAuthorization(t *testing.T) {
	request, err := http.NewRequest(http.MethodGet, "http://example.com/path?a=1", nil)
	if err != nil {
		t.Fatal(err)
	}
	request.Header.Set("Proxy-Authorization", "Basic secret")
	request.Header.Set("Proxy-Connection", "keep-alive")
	outbound, err := makeOutboundRequest(request)
	if err != nil {
		t.Fatal(err)
	}
	if outbound.RequestURI != "" || outbound.URL.RequestURI() != "/path?a=1" {
		t.Fatalf("unexpected outbound URL: %q", outbound.URL.String())
	}
	if outbound.Header.Get("Proxy-Authorization") != "" || outbound.Header.Get("Proxy-Connection") != "" {
		t.Fatal("proxy-only headers were forwarded")
	}
}

func TestProxyAuthenticationRejectsMissingAndInvalidCredentials(t *testing.T) {
	p := testProxy("test", "test123")
	for _, credentials := range []struct{ username, password string }{{"", ""}, {"wrong", "test123"}, {"test", "wrong"}} {
		request := httptest.NewRequest(http.MethodGet, "http://example.com/", nil)
		if credentials.username != "" {
			setProxyAuth(request, credentials.username, credentials.password)
		}
		response := httptest.NewRecorder()
		p.ServeHTTP(response, request)
		if response.Code != http.StatusProxyAuthRequired {
			t.Fatalf("credentials %q/%q returned %d, want 407", credentials.username, credentials.password, response.Code)
		}
		if response.Header().Get("Proxy-Authenticate") != `Basic realm="Private Proxy"` {
			t.Fatal("missing Proxy-Authenticate challenge")
		}
	}
}

func TestHTTPAuthenticationAllowsRequestAndStripsProxyAuthorization(t *testing.T) {
	p := testProxy("test", "test123")
	var forwarded *http.Request
	p.transport = roundTripperFunc(func(request *http.Request) (*http.Response, error) {
		forwarded = request
		return &http.Response{StatusCode: http.StatusNoContent, Header: make(http.Header), Body: http.NoBody}, nil
	})
	request := httptest.NewRequest(http.MethodGet, "http://example.com/path", nil)
	setProxyAuth(request, "test", "test123")
	response := httptest.NewRecorder()
	p.ServeHTTP(response, request)
	if response.Code != http.StatusNoContent {
		t.Fatalf("got %d, want 204", response.Code)
	}
	if forwarded == nil || forwarded.Header.Get("Proxy-Authorization") != "" {
		t.Fatal("Proxy-Authorization was forwarded")
	}
}

func TestProxyWithoutCredentialsAllowsRequest(t *testing.T) {
	p := testProxy("", "")
	p.transport = roundTripperFunc(func(request *http.Request) (*http.Response, error) {
		return &http.Response{StatusCode: http.StatusNoContent, Header: make(http.Header), Body: http.NoBody}, nil
	})
	request := httptest.NewRequest(http.MethodGet, "http://example.com/", nil)
	response := httptest.NewRecorder()
	p.ServeHTTP(response, request)
	if response.Code != http.StatusNoContent {
		t.Fatalf("got %d, want 204", response.Code)
	}
}

func TestConnectAuthenticationRejectsMissingAndAllowsCorrectCredentials(t *testing.T) {
	p := testProxy("test", "test123")
	missing := httptest.NewRequest(http.MethodConnect, "http://example.com:443", nil)
	missing.Host = "example.com:443"
	missingResponse := httptest.NewRecorder()
	p.ServeHTTP(missingResponse, missing)
	if missingResponse.Code != http.StatusProxyAuthRequired {
		t.Fatalf("missing CONNECT auth returned %d, want 407", missingResponse.Code)
	}

	valid := httptest.NewRequest(http.MethodConnect, "http://example.com:443", nil)
	valid.Host = "example.com:443"
	setProxyAuth(valid, "test", "test123")
	validResponse := httptest.NewRecorder()
	p.ServeHTTP(validResponse, valid)
	if validResponse.Code == http.StatusProxyAuthRequired {
		t.Fatal("valid CONNECT authentication was rejected")
	}
}
