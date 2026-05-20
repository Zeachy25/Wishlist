import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Animated,
  Dimensions,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useStore } from '../../../src/store/useStore';
import { searchProducts } from '../../../src/services/supabaseService';
import { Product } from '../../../src/types';
import SearchProductCard from '../../../src/components/SearchProductCard';
import SkeletonLoader from '../../../src/components/SkeletonLoader';

const { width } = Dimensions.get('window');

type FilterType = 'All' | 'Under ₱1,000' | '₱1k-₱5k' | 'Top Rated';
type SortType = 'Best Match' | 'Price: Low to High' | 'Price: High to Low' | 'Top Rated';

const FILTERS: FilterType[] = ['All', 'Under ₱1,000', '₱1k-₱5k', 'Top Rated'];

export default function BrowseScreen() {
  const router = useRouter();
  const addToWishlist = useStore((state) => state.addToWishlist);

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [activeSort, setActiveSort] = useState<SortType>('Best Match');
  
  const [data, setData] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const searchInputRef = useRef<TextInput>(null);
  const toastOpacity = useRef(new Animated.Value(0)).current;

  // Auto-focus on mount
  useEffect(() => {
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  }, []);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 400);
    return () => clearTimeout(handler);
  }, [query]);

  // Fetch data when debounced query changes
  useEffect(() => {
    setPage(1);
    fetchData(debouncedQuery, 1, true);
  }, [debouncedQuery]);

  const fetchData = async (searchQuery: string, pageNum: number, isReset: boolean) => {
    if (isReset) {
      setError(null);
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const response = await searchProducts(searchQuery, pageNum, 20);
      
      if (isReset) {
        setData(response.data);
      } else {
        setData((prev) => [...prev, ...response.data]);
      }
      
      setTotalCount(response.totalCount);
      setHasMore(response.data.length === 20);
    } catch (error) {
      console.error('Failed to fetch search results:', error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!loading && !loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchData(debouncedQuery, nextPage, false);
    }
  };

  const showToast = () => {
    Animated.sequence([
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleAddWishlist = (product: Product) => {
    addToWishlist(product);
    showToast();
  };

  const getFilteredAndSortedData = () => {
    let result = [...data];

    // Client-side filtering
    if (activeFilter === 'Under ₱1,000') {
      result = result.filter(p => p.current_price < 1000);
    } else if (activeFilter === '₱1k-₱5k') {
      result = result.filter(p => p.current_price >= 1000 && p.current_price <= 5000);
    } else if (activeFilter === 'Top Rated') {
      result = result.filter(p => p.rating >= 4.5);
    }

    // Client-side sorting
    if (activeSort === 'Price: Low to High') {
      result.sort((a, b) => a.current_price - b.current_price);
    } else if (activeSort === 'Price: High to Low') {
      result.sort((a, b) => b.current_price - a.current_price);
    } else if (activeSort === 'Top Rated') {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  };

  const displayData = getFilteredAndSortedData();

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <View style={styles.searchBar}>
          <MaterialCommunityIcons name="magnify" size={20} color="#999" />
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="wireless headphones"
            placeholderTextColor="#999"
            value={query}
            onChangeText={setQuery}
            autoCorrect={false}
            returnKeyType="search"
            onSubmitEditing={() => Keyboard.dismiss()}
          />
        </View>
        <TouchableOpacity style={styles.filterBtn}>
          <MaterialCommunityIcons name="filter-variant" size={24} color="#1A1A1A" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFilterSortBar = () => (
    <View style={styles.filterSortContainer}>
      <Text style={styles.resultsText}>
        {totalCount.toLocaleString()} results for &apos;{debouncedQuery || "all"}&apos;
      </Text>
      
      <View style={styles.pillsScroll}>
        {FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[styles.pill, activeFilter === filter && styles.pillActive]}
            onPress={() => setActiveFilter(filter)}
          >
            <Text style={[styles.pillText, activeFilter === filter && styles.pillTextActive]}>
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.sortRow}>
        <TouchableOpacity 
          style={styles.sortDropdown}
          onPress={() => {
            // Simple toggle for demo
            const sorts: SortType[] = ['Best Match', 'Price: Low to High', 'Price: High to Low', 'Top Rated'];
            const nextIdx = (sorts.indexOf(activeSort) + 1) % sorts.length;
            setActiveSort(sorts[nextIdx]);
          }}
        >
          <Text style={styles.sortText}>Sort: {activeSort}</Text>
          <MaterialCommunityIcons name="chevron-down" size={16} color="#1A1A1A" />
        </TouchableOpacity>
        
        <View style={styles.viewToggles}>
          <MaterialCommunityIcons name="view-grid-outline" size={20} color="#1A365D" style={styles.viewIcon} />
          <MaterialCommunityIcons name="format-list-bulleted" size={20} color="#999999" />
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="magnify" size={64} color="#E0E0E0" />
      <Text style={styles.emptyText}>No results for &apos;{debouncedQuery}&apos;</Text>
      <Text style={styles.emptySubtext}>Try checking your spelling or use more general terms.</Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="alert-circle-outline" size={64} color="#E0E0E0" />
      <Text style={styles.emptyText}>Something went wrong</Text>
      <Text style={styles.emptySubtext}>{error}</Text>
      <TouchableOpacity 
        style={styles.pill}
        onPress={() => fetchData(debouncedQuery, 1, true)}
      >
        <Text style={styles.pillTextActive}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingGrid}>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <View key={i} style={styles.skeletonCard}>
          <SkeletonLoader height={(width - 36) / 2} borderRadius={8} style={{ marginBottom: 8 }} />
          <SkeletonLoader height={14} width="90%" style={{ marginBottom: 4 }} />
          <SkeletonLoader height={14} width="70%" style={{ marginBottom: 12 }} />
          <SkeletonLoader height={18} width="40%" />
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      {renderHeader()}
      {renderFilterSortBar()}

      {error ? (
        renderErrorState()
      ) : loading ? (
        renderLoadingState()
      ) : displayData.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={displayData}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.gridContainer}
          columnWrapperStyle={styles.columnWrapper}
          renderItem={({ item }) => (
            <SearchProductCard product={item} onAddWishlist={handleAddWishlist} />
          )}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footerLoader}>
                <SkeletonLoader height={20} width={100} />
              </View>
            ) : null
          }
        />
      )}

      {/* Custom Toast */}
      <Animated.View style={[styles.toast, { opacity: toastOpacity }]} pointerEvents="none">
        <MaterialCommunityIcons name="check-circle" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
        <Text style={styles.toastText}>Added to Wishlist</Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    paddingRight: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    marginLeft: 8,
    fontSize: 14,
    color: '#1A1A1A',
  },
  filterBtn: {
    marginLeft: 12,
    padding: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  filterSortContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  resultsText: {
    fontSize: 14,
    color: '#666666',
    marginTop: 8,
    marginBottom: 12,
  },
  pillsScroll: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 8,
    backgroundColor: '#FFFFFF',
  },
  pillActive: {
    backgroundColor: '#1A365D',
    borderColor: '#1A365D',
  },
  pillText: {
    fontSize: 12,
    color: '#666666',
  },
  pillTextActive: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  sortRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sortDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortText: {
    fontSize: 13,
    color: '#1A1A1A',
    marginRight: 4,
  },
  viewToggles: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewIcon: {
    marginRight: 12,
  },
  gridContainer: {
    padding: 12,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  loadingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 12,
  },
  skeletonCard: {
    width: (width - 36) / 2,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
  footerLoader: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  toast: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: 'rgba(26, 54, 93, 0.9)', // Dark blue
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  toastText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
