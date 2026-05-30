package graphql

import (
	"testing"

	"cinema-management/server/internal/repository"
	"cinema-management/server/internal/usecase"
)

func TestNewHandlerBuildsSchema(t *testing.T) {
	uc := usecase.New(&repository.Repository{}, "test-secret")
	if _, err := NewHandler(uc); err != nil {
		t.Fatalf("build schema: %v", err)
	}
}
