package main

import (
	"io"
	"net"
	"net/http"
	"testing"
)

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
