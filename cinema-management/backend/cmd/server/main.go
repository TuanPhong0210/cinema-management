package main

import (
	"fmt"
	"log"
	"net/http"

	"cinema-management/backend/internal/config"
	"cinema-management/backend/internal/database"
	graphqlDelivery "cinema-management/backend/internal/delivery/graphql"
	grpcDelivery "cinema-management/backend/internal/delivery/grpc"
	"cinema-management/backend/internal/middleware"
	"cinema-management/backend/internal/repository"
	"cinema-management/backend/internal/usecase"
)

func main() {
	cfg := config.Load()

	db, err := database.Connect(cfg)
	if err != nil {
		log.Fatalf("connect database: %v", err)
	}
	if err := database.AutoMigrate(db); err != nil {
		log.Fatalf("auto migrate: %v", err)
	}
	if err := database.Seed(db); err != nil {
		log.Fatalf("seed database: %v", err)
	}

	uc := usecase.New(repository.New(db), cfg.JWTSecret)
	gqlHandler, err := graphqlDelivery.NewHandler(uc)
	if err != nil {
		log.Fatalf("build graphql schema: %v", err)
	}

	go func() {
		addr := ":" + cfg.GRPCPort
		log.Printf("gRPC server running on %s", addr)
		if err := grpcDelivery.NewServer(uc).Start(addr); err != nil {
			log.Fatalf("grpc server: %v", err)
		}
	}()

	mux := http.NewServeMux()
	mux.Handle("/graphql", gqlHandler)
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		_, _ = fmt.Fprint(w, "ok")
	})

	addr := ":" + cfg.GraphQLPort
	log.Printf("GraphQL server running on http://localhost%s/graphql", addr)
	log.Fatal(http.ListenAndServe(addr, middleware.CORS(mux)))
}
