import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  ScrollView,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { TopHeader } from "../components/TopHeader";

type FilterCategories = {
  [key: string]: string[];
};

const filterOptions: FilterCategories = {
  exfilter: ["다이어트", "체형교정", "바디프로필", "벌크업"],
};

interface FilterSideBarProps {
  visible: boolean;
  onClose: () => void;
  selectedSort: string;
  onSortChange: (sort: string) => void;
  sortOptions: { id: string; label: string }[];
  openedFromSort?: boolean;
  selectedFilters: string[];
  onFilterChange: (filters: string[]) => void;
}

const FilterSideBar: React.FC<FilterSideBarProps> = ({
  visible,
  onClose,
  selectedSort,
  onSortChange,
  sortOptions,
  openedFromSort,
  selectedFilters,
  onFilterChange,
}) => {
  const [isExtendedSort, setIsExtendedSort] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();

      if (openedFromSort) {
        setIsExtendedSort(true);
      } else {
        setIsExtendedSort(false);
      }
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();

      setIsExtendedSort(false);
    }
  }, [visible, openedFromSort]);

  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.filterOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View
          style={[styles.filterSideBar, { transform: [{ translateX }] }]}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={styles.filterContainer}
          >
            <View style={styles.filterHeader}>
              <Text style={styles.filterTitle}>정렬 및 필터</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="black" />
              </TouchableOpacity>
            </View>

            <View style={styles.sortSection}>
              <TouchableOpacity
                style={styles.sortTitleContainer}
                onPress={() => setIsExtendedSort(!isExtendedSort)}
              >
                <Text style={styles.sortSectionTitle}>정렬</Text>
                <Ionicons
                  name={isExtendedSort ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>

              {isExtendedSort &&
                sortOptions.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={styles.sortOptionItem}
                    onPress={() => {
                      onSortChange(option.id);
                      setIsExtendedSort(false);
                      onClose();
                    }}
                  >
                    <Text
                      style={[
                        styles.sortOptionText,
                        selectedSort === option.id &&
                          styles.sortOptionTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                    {selectedSort === option.id && (
                      <Ionicons name="checkmark" size={20} color="#004AAD" />
                    )}
                  </TouchableOpacity>
                ))}
            </View>

            <ScrollView style={styles.filterContent}>
              <View style={styles.filterGroup}>
                <View style={styles.filterCategoryHeader}>
                  <View style={styles.filterTitleRow}>
                    <Text style={styles.filterCategoryTitle}>필터</Text>
                    <TouchableOpacity
                      style={styles.resetButton}
                      onPress={() => onFilterChange([])}
                    >
                      <Text style={styles.resetButtonText}>초기화</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.filterOptionsContainer}>
                  {filterOptions.exfilter.map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={styles.filterOption}
                      onPress={() => {
                        if (selectedFilters.includes(option)) {
                          onFilterChange(
                            selectedFilters.filter((f) => f !== option)
                          );
                        } else {
                          onFilterChange([...selectedFilters, option]);
                        }
                      }}
                    >
                      <View style={styles.optionContainer}>
                        <View
                          style={[
                            styles.customCheckbox,
                            selectedFilters.includes(option) &&
                              styles.customCheckboxSelected,
                          ]}
                        >
                          {selectedFilters.includes(option) && (
                            <Ionicons name="checkmark" size={14} color="#fff" />
                          )}
                        </View>
                        <Text
                          style={[
                            styles.filterOptionText,
                            selectedFilters.includes(option) &&
                              styles.filterOptionTextSelected,
                          ]}
                        >
                          {option}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

interface Trainer {
  id: number;
  name: string;
  image: any;
  rating: number;
  reviews: number;
  address: string;
  tags: string[];
  price: number;
  discount: number;
}

const initialTrainers: Trainer[] = [
  {
    id: 1,
    name: "김정우",
    image: require("../assets/trainer.jpg"),
    rating: 4.7,
    reviews: 189,
    address: "서울시 강남구",
    tags: ["다이어트", "체형교정"],
    price: 60000,
    discount: 50,
  },
  {
    id: 2,
    name: "이민호",
    image: require("../assets/trainer.jpg"),
    rating: 4.9,
    reviews: 156,
    address: "서울시 서초구",
    tags: ["바디프로필", "벌크업"],
    price: 55000,
    discount: 30,
  },
  {
    id: 3,
    name: "박서준",
    image: require("../assets/trainer.jpg"),
    rating: 4.5,
    reviews: 210,
    address: "서울시 송파구",
    tags: ["다이어트", "벌크업"],
    price: 50000,
    discount: 40,
  },
  {
    id: 4,
    name: "최우식",
    image: require("../assets/trainer.jpg"),
    rating: 4.8,
    reviews: 178,
    address: "서울시 마포구",
    tags: ["체형교정", "바디프로필"],
    price: 65000,
    discount: 35,
  },
  {
    id: 5,
    name: "정해인",
    image: require("../assets/trainer.jpg"),
    rating: 4.6,
    reviews: 167,
    address: "서울시 용산구",
    tags: ["다이어트", "바디프로필"],
    price: 58000,
    discount: 45,
  },
];

const TrainerCard: React.FC<{ trainer: Trainer }> = ({ trainer }) => (
  <View style={styles.card}>
    <Image source={trainer.image} style={styles.trainerImage} />
    <View style={styles.cardContent}>
      <View style={styles.cardHeader}>
        <Text style={styles.trainerName}>{trainer.name}</Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.rating}>{trainer.rating}</Text>
          <Text style={styles.reviews}>({trainer.reviews})</Text>
        </View>
      </View>
      <Text style={styles.address}>{trainer.address}</Text>
      <View style={styles.tagsContainer}>
        {trainer.tags.map((tag, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>
      <View style={styles.priceContainer}>
        <Text style={styles.discount}>{trainer.discount}% 할인</Text>
        <Text style={styles.price}>{trainer.price.toLocaleString()}원</Text>
      </View>
    </View>
  </View>
);

const SearchScreen = () => {
  const [searchCategory, setSearchCategory] = useState<"address" | "name">(
    "address"
  );
  const [selectedSort, setSelectedSort] = useState("recommended");
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [openedFromSort, setOpenedFromSort] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [trainers, setTrainers] = useState<Trainer[]>(initialTrainers);

  const sortOptions = [
    { id: "recommended", label: "추천순" },
    { id: "distance", label: "거리순" },
    { id: "rating", label: "평점순" },
    { id: "review", label: "리뷰순" },
  ];

  const categoryOptions = [
    { id: "address", label: "주소" },
    { id: "name", label: "이름" },
  ];

  useEffect(() => {
    let filtered = [...initialTrainers];

    if (searchQuery) {
      filtered = filtered.filter((trainer) => {
        const searchField =
          searchCategory === "address" ? trainer.address : trainer.name;
        return searchField.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }

    if (selectedFilters.length > 0) {
      filtered = filtered.filter((trainer) =>
        selectedFilters.some((filter) => trainer.tags.includes(filter))
      );
    }

    switch (selectedSort) {
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "review":
        filtered.sort((a, b) => b.reviews - a.reviews);
        break;
      // 추천순과 거리순은 비활성화
    }

    setTrainers(filtered);
  }, [searchQuery, selectedSort, selectedFilters, searchCategory]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopHeader />
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <TouchableOpacity
              style={[styles.categoryButton, { width: 80 }]}
              onPress={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
            >
              <Text
                style={[
                  styles.categoryText,
                  { textAlign: "left", width: "100%" },
                ]}
              >
                {searchCategory === "address" ? "주소" : "이름"}
              </Text>
              <Ionicons
                name="chevron-down"
                size={16}
                color="#666"
                style={{ position: "absolute", right: 5 }}
              />
            </TouchableOpacity>

            {isCategoryDropdownOpen && (
              <View style={styles.categoryDropdown}>
                {categoryOptions
                  .filter((option) => option.id !== searchCategory)
                  .map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      style={styles.categoryDropdownItem}
                      onPress={() => {
                        setSearchCategory(option.id as "address" | "name");
                        setIsCategoryDropdownOpen(false);
                      }}
                    >
                      <Text style={styles.categoryDropdownItemText}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
              </View>
            )}
          </View>

          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="원하는 트레이너를 검색해보세요"
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity style={styles.searchButton}>
              <Ionicons name="search" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.filtersArea}>
          {selectedFilters.length > 0 && (
            <ScrollView
              horizontal
              style={styles.selectedFiltersContainer}
              showsHorizontalScrollIndicator={false}
            >
              {selectedFilters.map((filter) => (
                <TouchableOpacity
                  key={filter}
                  style={styles.selectedFilterButton}
                  onPress={() =>
                    setSelectedFilters(
                      selectedFilters.filter((f) => f !== filter)
                    )
                  }
                >
                  <Text style={styles.selectedFilterText}>{filter}</Text>
                  <Ionicons
                    name="close"
                    size={12}
                    color="#666"
                    style={styles.selectedFilterIcon}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          <View style={styles.filterSection}>
            <TouchableOpacity
              style={styles.sortTriggerButton}
              onPress={() => {
                setOpenedFromSort(true);
                setIsFilterVisible(true);
              }}
            >
              <Text style={styles.sortTriggerText}>
                {sortOptions.find((opt) => opt.id === selectedSort)?.label ||
                  "추천순"}
              </Text>
              <Text style={{ color: "#666", fontSize: 16 }}>↑↓</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => {
                setOpenedFromSort(false);
                setIsFilterVisible(true);
              }}
            >
              <Ionicons
                name="options-outline"
                size={16}
                color="#666"
                style={{ marginRight: 4 }}
              />
              <Text style={styles.filterButtonText}>필터</Text>
              {selectedFilters.length > 0 && (
                <Text style={styles.filterCount}>
                  ({selectedFilters.length})
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <FilterSideBar
            visible={isFilterVisible}
            onClose={() => {
              setIsFilterVisible(false);
              setOpenedFromSort(false);
            }}
            selectedSort={selectedSort}
            onSortChange={setSelectedSort}
            sortOptions={sortOptions}
            openedFromSort={openedFromSort}
            selectedFilters={selectedFilters}
            onFilterChange={setSelectedFilters}
          />
        </View>

        <ScrollView style={styles.cardContainer}>
          {trainers.map((trainer) => (
            <TrainerCard key={trainer.id} trainer={trainer} />
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingTop: 50,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    zIndex: 999,
  },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    backgroundColor: "#f5f5f5",
  },
  categoryText: {
    fontSize: 14,
    marginRight: 4,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
    padding: 8,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  searchButton: {
    padding: 4,
  },
  filterSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: 15,
    paddingVertical: 8,
    // borderBottomWidth: 1,
    // borderBottomColor: '#eee',
  },
  filterButtonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  sortTriggerButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  sortTriggerText: {
    fontSize: 14,
    color: "#666",
    marginRight: 5,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
    backgroundColor: "#f5f5f5",
  },
  filterButtonText: {
    fontSize: 13,
    color: "#666",
  },
  filterCount: {
    fontSize: 13,
    color: "#007AFF",
    marginLeft: 2,
  },
  filterOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  filterSideBar: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 250,
    height: "100%",
    backgroundColor: "white",
  },
  filterContainer: {
    flex: 1,
  },
  filterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  filterContent: {
    flex: 1,
  },
  filterTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  resetButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  resetButtonText: {
    fontSize: 13,
    color: "#007AFF",
    fontWeight: "500",
  },
  filterResetButton: {
    flex: 1,
    alignItems: "center",
    padding: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 10,
    borderRadius: 4,
  },
  filterApplyButton: {
    flex: 1,
    alignItems: "center",
    padding: 15,
    backgroundColor: "#004AAD",
    borderRadius: 4,
  },
  filterApplyButtonText: {
    color: "white",
    fontWeight: "600",
  },
  categoryDropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    width: "100%",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 4,
    zIndex: 999,
    elevation: 5,
  },
  categoryDropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  categoryDropdownItemText: {
    fontSize: 14,
  },
  sortSection: {
    padding: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  sortSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  sortOptionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  sortOptionText: {
    fontSize: 14,
    color: "#666",
  },
  sortOptionTextActive: {
    color: "#004AAD",
    fontWeight: "600",
  },
  sortTitleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  filterGroup: {
    paddingTop: 10,
  },
  filterCategoryHeader: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  filterCategoryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  filterOptionsContainer: {
    width: "100%",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  filterOption: {
    width: "100%",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  customCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    backgroundColor: "#fff",
  },
  customCheckboxSelected: {
    backgroundColor: "#004AAD",
    borderColor: "#004AAD",
  },
  filterOptionSelected: {
    backgroundColor: "#e8f0fe",
  },
  filterOptionText: {
    fontSize: 15,
    color: "#666",
    fontWeight: "400",
  },
  filterOptionTextSelected: {
    color: "#004AAD",
    fontWeight: "500",
  },
  selectedFiltersContainer: {
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  selectedFilterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginRight: 6,
    height: 20,
  },
  selectedFilterText: {
    fontSize: 11,
    color: "#333",
    marginRight: 2,
    lineHeight: 14,
  },
  selectedFilterIcon: {
    marginLeft: 2,
  },
  filtersArea: {
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    zIndex: 1,
  },
  cardContainer: {
    flex: 1,
    padding: 16,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 16,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trainerImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  cardContent: {
    flex: 1,
    marginLeft: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  trainerName: {
    fontSize: 16,
    fontWeight: "600",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rating: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 4,
  },
  reviews: {
    fontSize: 14,
    color: "#666",
    marginLeft: 2,
  },
  address: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  tag: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: "#666",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  discount: {
    fontSize: 14,
    color: "#ff3b30",
    fontWeight: "500",
    marginRight: 8,
  },
  price: {
    fontSize: 14,
    fontWeight: "500",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
export default SearchScreen;
