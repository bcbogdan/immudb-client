package common

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/patrickmn/go-cache"
)

type InternalCache struct {
	cache     *cache.Cache
	cacheKeys []string
}

func NewInternalCache(defaultExpiration time.Duration, cleanupInterval time.Duration) *InternalCache {
	return &InternalCache{
		cache:     cache.New(defaultExpiration, cleanupInterval),
		cacheKeys: make([]string, 0),
	}
}

func (ic *InternalCache) Cache(key string, result interface{}) {
	ic.cache.Set(key, result, cache.DefaultExpiration)
	ic.cacheKeys = append(ic.cacheKeys, key)
}

func (ic *InternalCache) InvalidateCache() {
	for _, key := range ic.cacheKeys {
		ic.cache.Delete(key)
	}
	ic.cacheKeys = make([]string, 0)
}

func (ic *InternalCache) SerializeArgs(args ...interface{}) (string, error) {
	argsJson, err := json.Marshal(args)
	if err != nil {
		return "", fmt.Errorf("failed to serialize args: %v", err)
	}
	return string(argsJson), nil
}
