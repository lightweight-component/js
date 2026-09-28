package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
)

func main() {
	listen := flag.String("listen", "127.0.0.1:8080", "HTTP proxy listen address")
	socks := flag.String("socks", "127.0.0.1:1080", "SOCKS5 upstream address")
	verbose := flag.Bool("v", false, "enable request logs")
	flag.Parse()

	logger := log.New(os.Stderr, "", log.LstdFlags)
	p := NewProxy(*socks, *verbose, logger)
	if conn, err := net.DialTimeout("tcp", *socks, 2*time.Second); err != nil {
		logger.Printf("Warning: SOCKS5 upstream %s is currently unavailable.", *socks)
	} else {
		_ = conn.Close()
	}

	server := &http.Server{
		Addr:              *listen,
		Handler:           p,
		ReadHeaderTimeout: 15 * time.Second,
		IdleTimeout:       90 * time.Second,
		ErrorLog:          logger,
	}
	listener, err := net.Listen("tcp", *listen)
	if err != nil {
		logger.Printf("Failed to listen on %s: %v", *listen, err)
		os.Exit(1)
	}
	defer listener.Close()

	fmt.Println("Local HTTP Proxy")
	fmt.Printf("Listen : %s\n", *listen)
	fmt.Printf("SOCKS5 : %s\n", *socks)

	serverErr := make(chan error, 1)
	go func() { serverErr <- server.Serve(listener) }()
	signals := make(chan os.Signal, 1)
	signal.Notify(signals, os.Interrupt, syscall.SIGTERM)

	select {
	case sig := <-signals:
		logger.Printf("Received %s, shutting down...", sig)
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		if err := server.Shutdown(ctx); err != nil {
			logger.Printf("HTTP server shutdown: %v", err)
		}
		p.CloseTunnels()
	case err := <-serverErr:
		if err != nil && err != http.ErrServerClosed {
			logger.Printf("HTTP server stopped: %v", err)
		}
	}
}
