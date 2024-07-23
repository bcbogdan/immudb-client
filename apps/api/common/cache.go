package common

import (
	"github.com/patrickmn/go-cache"
)

type InternalCache struct {
	keys []string
}

func NewInternalCache() *InternalCache {
	return &InternalCache{
		keys: []string{},
	}
}

func (ic *InternalCache) Get(key string) (interface{}, bool) {
	c := cache.New(cache.NoExpiration, cache.NoExpiration)
	value, found := c.Get(key)
	if found {
		return value, true
	}
	return nil, false
}

// set cache key with default expiration
// invalidate all cache keys
