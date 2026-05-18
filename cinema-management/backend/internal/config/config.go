package config

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	DBHost      string
	DBPort      string
	DBUser      string
	DBPassword  string
	DBName      string
	JWTSecret   string
	GraphQLPort string
	GRPCPort    string
}

func Load() Config {
	_ = godotenv.Load()
	return Config{
		DBHost:      env("POSTGRES_HOST", "localhost"),
		DBPort:      env("POSTGRES_PORT", "5432"),
		DBUser:      env("POSTGRES_USER", "cinema_user"),
		DBPassword:  env("POSTGRES_PASSWORD", "cinema_password"),
		DBName:      env("POSTGRES_DB", "cinema_db"),
		JWTSecret:   env("JWT_SECRET", "cinema_secret_key"),
		GraphQLPort: env("GRAPHQL_PORT", "8080"),
		GRPCPort:    env("GRPC_PORT", "50051"),
	}
}

func (c Config) DSN() string {
	return fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Ho_Chi_Minh", c.DBHost, c.DBUser, c.DBPassword, c.DBName, c.DBPort)
}

func env(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
