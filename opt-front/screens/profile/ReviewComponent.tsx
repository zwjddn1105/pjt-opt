import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native";
import axios from "axios";
import { EXPO_PUBLIC_BASE_URL } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Review {
  id: number;
  trainerId: number;
  comment: string;
  createdAt: string;
  rate: number;
}

interface ReviewComponentProps {
  trainerId: number;
}

const ReviewComponent: React.FC<ReviewComponentProps> = ({ trainerId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchReviews = async (pageNumber: number) => {
    if (!hasMore || isLoading) return;

    setIsLoading(true);
    try {
      const refreshToken = await AsyncStorage.getItem("refreshToken");
      const response = await axios.get(
        `${EXPO_PUBLIC_BASE_URL}/trainer-reviews/${trainerId}`,
        {
          params: {
            page: pageNumber,
            size: 10,
            sort: "id,desc", // 최신순
          },
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
        }
      );

      const newReviews = response.data.content;
      setReviews((prevReviews) => [...prevReviews, ...newReviews]);
      setHasMore(!response.data.last); // 마지막 페이지 여부 확인
    } catch (error) {
      console.error("리뷰 데이터를 가져오는 중 오류 발생:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(page);
  }, [page]);

  const loadMoreReviews = () => {
    if (!isLoading && hasMore) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const renderReviewItem = ({ item }: { item: Review }) => (
    <View style={styles.reviewItem}>
      <View style={styles.reviewHeader}>
        <Image
          source={{ uri: "/api/placeholder/40/40" }}
          style={styles.reviewerImage}
        />
        <View style={styles.reviewerInfo}>
          <Text style={styles.reviewerName}>익명</Text>
          <Text style={styles.reviewDate}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <Text style={styles.reviewRating}>{item.rate}점</Text>
      </View>
      <Text style={styles.reviewContent}>{item.comment}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={reviews}
        renderItem={renderReviewItem}
        keyExtractor={(item) => item.id.toString()}
        onEndReached={loadMoreReviews}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isLoading ? <ActivityIndicator size="small" color="#0000ff" /> : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  reviewItem: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 16,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  reviewerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: "#ccc",
  },
  reviewerInfo: {
    flexDirection: "column",
    flexGrow: 1,
    marginRight: "auto",
  },
  reviewerName: {
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: -2,
  },
  reviewDate: {
    fontSize: 12,
    color: "#666",
  },
  reviewRating: {
    fontSize: 14,
    color: "#FFD700",
    fontWeight: "bold",
    marginLeft: "auto",
  },
  reviewContent: {
    fontSize: 14,
    lineHeight: 20,
    color: "#333",
  },
});

export default ReviewComponent;
