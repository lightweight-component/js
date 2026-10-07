package main

import (
	"bufio"
	"context"
	"crypto/sha256"
	"crypto/subtle"
	"encoding/base64"
	"errors"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"strconv"
	"strings"
	"sync"
	"time"
)

const socksConnectTimeout = 12 * time.Second

type Proxy struct {
	dialer    *SOCKS5Dialer
	transport http.RoundTripper
	auth      proxyAuth
	verbose   bool
	logger    *log.Logger
	mu        sync.Mutex
	tunnels   map[net.Conn]struct{}
}

type proxyAuth struct {
	enabled  bool
	expected [sha256.Size]byte
}

type SOCKS5Dialer struct {
	address string
	timeout time.Duration
}

func NewProxy(socksAddress, username, password string, verbose bool, logger *log.Logger) *Proxy {
	p := &Proxy{dialer: &SOCKS5Dialer{address: socksAddress, timeout: socksConnectTimeout}, verbose: verbose, logger: logger, tunnels: make(map[net.Conn]struct{})}
	if username != "" && password != "" {
		p.auth = proxyAuth{enabled: true, expected: sha256.Sum256([]byte(username + ":" + password))}
	}
	p.transport = &http.Transport{
		Proxy:                 nil,
		DialContext:           p.dialer.DialContext,
		ForceAttemptHTTP2:     false,
		MaxIdleConns:          64,
		MaxIdleConnsPerHost:   8,
		IdleConnTimeout:       90 * time.Second,
		TLSHandshakeTimeout:   15 * time.Second,
		ResponseHeaderTimeout: 30 * time.Second,
		ExpectContinueTimeout: time.Second,
	}
	return p
}

func (p *Proxy) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if !p.authorize(r) {
		w.Header().Set("Proxy-Authenticate", `Basic realm="Private Proxy"`)
		http.Error(w, "Proxy Authentication Required", http.StatusProxyAuthRequired)
		if p.verbose {
			p.logger.Print("407 Proxy Authentication Required")
		}
		return
	}
	r.Header.Del("Proxy-Authorization")
	if r.Method == http.MethodConnect {
		p.handleConnect(w, r)
		return
	}
	p.handleHTTP(w, r)
}

func (p *Proxy) AuthStatus() string {
	if p.auth.enabled {
		return "enabled"
	}
	return "disabled"
}

func (p *Proxy) authorize(r *http.Request) bool {
	if !p.auth.enabled {
		return true
	}
	fields := strings.Fields(r.Header.Get("Proxy-Authorization"))
	if len(fields) != 2 || !strings.EqualFold(fields[0], "Basic") {
		return false
	}
	credentials, err := base64.StdEncoding.DecodeString(fields[1])
	if err != nil {
		return false
	}
	provided := sha256.Sum256(credentials)
	return subtle.ConstantTimeCompare(p.auth.expected[:], provided[:]) == 1
}

func (p *Proxy) handleConnect(w http.ResponseWriter, r *http.Request) {
	target, err := validTarget(r.Host)
	if err != nil {
		http.Error(w, "Bad CONNECT target", http.StatusBadRequest)
		return
	}
	p.logRequest("CONNECT", target)
	upstream, err := p.dialer.DialContext(r.Context(), "tcp", target)
	if err != nil {
		p.logger.Printf("CONNECT %s failed: %v", target, err)
		http.Error(w, "Bad Gateway", http.StatusBadGateway)
		return
	}
	hijacker, ok := w.(http.Hijacker)
	if !ok {
		_ = upstream.Close()
		http.Error(w, "Hijacking is not supported", http.StatusInternalServerError)
		return
	}
	client, clientBuffer, err := hijacker.Hijack()
	if err != nil {
		_ = upstream.Close()
		return
	}
	p.trackTunnel(client)
	defer func() {
		p.untrackTunnel(client)
		_ = client.Close()
		_ = upstream.Close()
	}()
	if _, err := clientBuffer.WriteString("HTTP/1.1 200 Connection Established\r\n\r\n"); err != nil {
		return
	}
	if err := clientBuffer.Flush(); err != nil {
		return
	}
	p.relay(client, clientBuffer.Reader, upstream)
}

func (p *Proxy) handleHTTP(w http.ResponseWriter, r *http.Request) {
	outbound, err := makeOutboundRequest(r)
	if err != nil {
		http.Error(w, "Bad Request", http.StatusBadRequest)
		return
	}
	p.logRequest(r.Method, outbound.URL.Host)
	response, err := p.transport.RoundTrip(outbound)
	if err != nil {
		p.logger.Printf("HTTP %s %s failed: %v", r.Method, outbound.URL.Host, err)
		http.Error(w, "Bad Gateway", http.StatusBadGateway)
		return
	}
	defer response.Body.Close()
	if response.StatusCode == http.StatusSwitchingProtocols {
		p.handleUpgrade(w, response)
		return
	}
	copyHeaders(w.Header(), response.Header, false)
	w.WriteHeader(response.StatusCode)
	_, _ = io.Copy(w, response.Body)
}

func (p *Proxy) handleUpgrade(w http.ResponseWriter, response *http.Response) {
	upstream, ok := response.Body.(io.ReadWriteCloser)
	if !ok {
		http.Error(w, "Bad Gateway", http.StatusBadGateway)
		return
	}
	hijacker, ok := w.(http.Hijacker)
	if !ok {
		http.Error(w, "Hijacking is not supported", http.StatusInternalServerError)
		return
	}
	client, clientBuffer, err := hijacker.Hijack()
	if err != nil {
		return
	}
	p.trackTunnel(client)
	defer func() {
		p.untrackTunnel(client)
		_ = client.Close()
		_ = upstream.Close()
	}()
	if err := response.Write(clientBuffer); err != nil {
		return
	}
	if err := clientBuffer.Flush(); err != nil {
		return
	}
	p.relay(client, clientBuffer.Reader, upstream)
}

func (p *Proxy) relay(client net.Conn, clientReader *bufio.Reader, upstream io.ReadWriteCloser) {
	done := make(chan struct{}, 2)
	go func() {
		_, _ = io.Copy(upstream, clientReader)
		if closeWriter, ok := upstream.(interface{ CloseWrite() error }); ok {
			_ = closeWriter.CloseWrite()
		}
		done <- struct{}{}
	}()
	go func() {
		_, _ = io.Copy(client, upstream)
		if tcp, ok := client.(*net.TCPConn); ok {
			_ = tcp.CloseWrite()
		}
		done <- struct{}{}
	}()
	<-done
	<-done
}

func (p *Proxy) trackTunnel(conn net.Conn) {
	p.mu.Lock()
	p.tunnels[conn] = struct{}{}
	p.mu.Unlock()
}

func (p *Proxy) untrackTunnel(conn net.Conn) {
	p.mu.Lock()
	delete(p.tunnels, conn)
	p.mu.Unlock()
}

func (p *Proxy) CloseTunnels() {
	p.mu.Lock()
	defer p.mu.Unlock()
	for conn := range p.tunnels {
		_ = conn.Close()
	}
}

func (p *Proxy) logRequest(method, target string) {
	if p.verbose {
		p.logger.Printf("%s %s", method, target)
	}
}

func (d *SOCKS5Dialer) DialContext(ctx context.Context, network, target string) (net.Conn, error) {
	if network != "tcp" && network != "tcp4" && network != "tcp6" {
		return nil, fmt.Errorf("SOCKS5 supports TCP only, got %q", network)
	}
	if _, err := validTarget(target); err != nil {
		return nil, err
	}
	conn, err := (&net.Dialer{Timeout: d.timeout}).DialContext(ctx, "tcp", d.address)
	if err != nil {
		return nil, fmt.Errorf("connect SOCKS5 upstream: %w", err)
	}
	deadline := time.Now().Add(d.timeout)
	if err := conn.SetDeadline(deadline); err != nil {
		_ = conn.Close()
		return nil, err
	}
	if err := socks5Connect(conn, target); err != nil {
		_ = conn.Close()
		return nil, err
	}
	if err := conn.SetDeadline(time.Time{}); err != nil {
		_ = conn.Close()
		return nil, err
	}
	return conn, nil
}

func socks5Connect(conn net.Conn, target string) error {
	if _, err := conn.Write([]byte{5, 1, 0}); err != nil {
		return fmt.Errorf("SOCKS5 greeting: %w", err)
	}
	method := make([]byte, 2)
	if _, err := io.ReadFull(conn, method); err != nil {
		return fmt.Errorf("SOCKS5 greeting response: %w", err)
	}
	if method[0] != 5 || method[1] != 0 {
		return errors.New("SOCKS5 upstream does not allow no-authentication")
	}
	host, portText, err := net.SplitHostPort(target)
	if err != nil {
		return fmt.Errorf("invalid target %q: %w", target, err)
	}
	port, err := strconv.ParseUint(portText, 10, 16)
	if err != nil || port == 0 {
		return fmt.Errorf("invalid target port %q", portText)
	}
	request := []byte{5, 1, 0}
	if ip := net.ParseIP(host); ip != nil {
		if ip4 := ip.To4(); ip4 != nil {
			request = append(request, 1)
			request = append(request, ip4...)
		} else {
			request = append(request, 4)
			request = append(request, ip.To16()...)
		}
	} else {
		if len(host) == 0 || len(host) > 255 {
			return errors.New("SOCKS5 target hostname must contain 1 to 255 bytes")
		}
		request = append(request, 3, byte(len(host)))
		request = append(request, host...)
	}
	request = append(request, byte(port>>8), byte(port))
	if _, err := conn.Write(request); err != nil {
		return fmt.Errorf("SOCKS5 connect request: %w", err)
	}
	reply := make([]byte, 4)
	if _, err := io.ReadFull(conn, reply); err != nil {
		return fmt.Errorf("SOCKS5 connect response: %w", err)
	}
	if reply[0] != 5 || reply[1] != 0 {
		return fmt.Errorf("SOCKS5 connect failed: %s", socksReplyError(reply[1]))
	}
	addressLength := 0
	switch reply[3] {
	case 1:
		addressLength = 4
	case 4:
		addressLength = 16
	case 3:
		length := []byte{0}
		if _, err := io.ReadFull(conn, length); err != nil {
			return fmt.Errorf("SOCKS5 domain length: %w", err)
		}
		addressLength = int(length[0])
	default:
		return fmt.Errorf("SOCKS5 returned unsupported address type %d", reply[3])
	}
	if _, err := io.CopyN(io.Discard, conn, int64(addressLength+2)); err != nil {
		return fmt.Errorf("SOCKS5 connect response address: %w", err)
	}
	return nil
}

func socksReplyError(code byte) string {
	messages := map[byte]string{1: "general failure", 2: "connection not allowed", 3: "network unreachable", 4: "host unreachable", 5: "connection refused", 6: "TTL expired", 7: "command not supported", 8: "address type not supported"}
	if message, ok := messages[code]; ok {
		return message
	}
	return fmt.Sprintf("unknown error %d", code)
}

func makeOutboundRequest(request *http.Request) (*http.Request, error) {
	outbound := request.Clone(request.Context())
	if outbound.URL.Scheme == "" {
		outbound.URL.Scheme = "http"
		outbound.URL.Host = outbound.Host
	}
	if outbound.URL.Scheme != "http" || outbound.URL.Host == "" {
		return nil, errors.New("HTTP proxy request must use an http URL")
	}
	if _, err := validTarget(withDefaultPort(outbound.URL.Host, "80")); err != nil {
		return nil, err
	}
	outbound.RequestURI = ""
	removeHopHeaders(outbound.Header, outbound.Header.Get("Upgrade") != "")
	return outbound, nil
}

func validTarget(target string) (string, error) {
	host, port, err := net.SplitHostPort(target)
	if err != nil || host == "" || port == "" {
		return "", fmt.Errorf("target must be host:port")
	}
	value, err := strconv.ParseUint(port, 10, 16)
	if err != nil || value == 0 {
		return "", fmt.Errorf("invalid target port")
	}
	return net.JoinHostPort(host, port), nil
}

func withDefaultPort(hostport, port string) string {
	if _, _, err := net.SplitHostPort(hostport); err == nil {
		return hostport
	}
	return net.JoinHostPort(hostport, port)
}

func removeHopHeaders(header http.Header, preserveUpgrade bool) {
	keepUpgrade := preserveUpgrade && header.Get("Upgrade") != ""
	for _, value := range header.Values("Connection") {
		for _, field := range strings.Split(value, ",") {
			if keepUpgrade && strings.EqualFold(strings.TrimSpace(field), "Upgrade") {
				continue
			}
			header.Del(strings.TrimSpace(field))
		}
	}
	fields := []string{"Keep-Alive", "Proxy-Authenticate", "Proxy-Authorization", "Proxy-Connection", "Te", "Trailer", "Transfer-Encoding"}
	if !keepUpgrade {
		fields = append(fields, "Connection")
	}
	for _, field := range fields {
		header.Del(field)
	}
	if !keepUpgrade {
		header.Del("Upgrade")
	} else {
		header.Set("Connection", "Upgrade")
	}
}

func copyHeaders(destination, source http.Header, preserveUpgrade bool) {
	copy := source.Clone()
	removeHopHeaders(copy, preserveUpgrade)
	for key, values := range copy {
		for _, value := range values {
			destination.Add(key, value)
		}
	}
}
