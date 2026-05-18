package graphql

import (
	"testing"

	"cinema-management/backend/internal/repository"
	"cinema-management/backend/internal/usecase"
)

func TestNewHandlerBuildsSchema(t *testing.T) {
	uc := usecase.New(&repository.Repository{}, "test-secret")
	if _, err := NewHandler(uc); err != nil {
		t.Fatalf("build schema: %v", err)
	}
}
