import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
  FlatList,
  Dimensions,
} from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { TopHeader } from "../components/TopHeader";
import PlusButton from '../components/PlusButton';
import { AddScheduleModal } from '../components/AddScheduleModal';
import { AddTicketModal } from '../components/AddTicketModal';
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width: WINDOW_WIDTH } = Dimensions.get('window');
const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

interface Schedule {
  id: number;
  nickname: string;
  startTime: Date;
  endTime: Date;
}

interface Session {
  id: number;
  ticketId: number;
  number: number;
  startAt: string;
  endAt: string;
  trainerSigned: boolean;
  memberSigned: boolean;
}

interface Ticket {
  id: number;
  trainerName: string | null;
  studentName: string | null;
  price: number;
  totalSessions: number;
  startDate: string;
  lastUsedDate: string;
  usedSessions: number;
  status: string;
  sessions: Session[];
}

interface PageableResponse {
  content: Ticket[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
}

interface Props {
  navigation: any;
  route: any;
}

export const ManageScreen: React.FC<Props> = ({ navigation, route }) => {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [isScheduleModalVisible, setIsScheduleModalVisible] = useState(false);
  const [isTicketModalVisible, setIsTicketModalVisible] = useState(false);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [animationHeight] = useState(new Animated.Value(0));
  const [userRole, setUserRole] = useState<string>('');
  const [activeTickets, setActiveTickets] = useState<Ticket[]>([]);
  const [completedTickets, setCompletedTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    const getUserRole = async () => {
      try {
        const role = await AsyncStorage.getItem('role');
        setUserRole(role || '');
      } catch (error) {
        console.error('Failed to get user role:', error);
      }
    };
    getUserRole();
    loadSchedules();
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('로그인이 필요합니다.');
      }

      const headers = {
        'Authorization': `Bearer ${refreshToken}`,
        'Content-Type': 'application/json',
      };

      // 진행중인 티켓 로드
      const activeEndpoint = userRole === 'ROLE_TRAINER' 
        ? '/tickets/trainer-not-used'
        : '/tickets/student-not-used';
      const activeResponse = await fetch(`${BASE_URL}${activeEndpoint}`, {
        headers,
      });
      const activeData: PageableResponse = await activeResponse.json();
      setActiveTickets(activeData.content);

      // 완료된 티켓 로드
      const completedEndpoint = userRole === 'ROLE_TRAINER'
        ? '/tickets/trainer-used'
        : '/tickets/student-used';
      const completedResponse = await fetch(`${BASE_URL}${completedEndpoint}`, {
        headers,
      });
      const completedData: PageableResponse = await completedResponse.json();
      setCompletedTickets(completedData.content);
    } catch (error) {
      console.error('Failed to load tickets:', error);
    }
  };

  const loadSchedules = async () => {
    try {
      const savedSchedules = await AsyncStorage.getItem('schedules');
      if (savedSchedules) {
        const parsedSchedules = JSON.parse(savedSchedules);
        const schedulesWithDates = parsedSchedules.map((schedule: Schedule) => ({
          ...schedule,
          startTime: new Date(schedule.startTime),
          endTime: new Date(schedule.endTime)
        }));
        setSchedules(schedulesWithDates);
      }
    } catch (error) {
      console.error('Failed to load schedules:', error);
    }
  };

  const formatScheduleTime = (startTime: Date, endTime: Date) => {
    const formatTime = (date: Date) => {
      return date.toLocaleTimeString('ko-KR', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }).replace(/\s+/g, ' ');
    };

    if (startTime.getDate() !== endTime.getDate() ||
        startTime.getMonth() !== endTime.getMonth()) {
      return `${startTime.getMonth() + 1}월 ${startTime.getDate()}일 ${formatTime(startTime)} - ${endTime.getMonth() + 1}월 ${endTime.getDate()}일 ${formatTime(endTime)}`;
    }

    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    if (!date || isNaN(date.getTime())) {
      return '-';
    }
    
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\. /g, '.').slice(0, -1);
  };

  const formatSessionDateTime = (dateString: string | null) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    if (!date || isNaN(date.getTime())) {
      return '';
    }
    
    return date.toLocaleString('ko-KR', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const filteredSchedules = schedules
    .filter((schedule: Schedule) => {
      const startDate = new Date(schedule.startTime);
      const endDate = new Date(schedule.endTime);
      const checkDate = new Date(selectedDate);

      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);
      checkDate.setHours(0, 0, 0, 0);

      return checkDate >= startDate && checkDate <= endDate;
    })
    .sort((a: Schedule, b: Schedule) => {
      const timeA = new Date(a.startTime).getTime();
      const timeB = new Date(b.startTime).getTime();
      return timeA - timeB;
    });

  const getDayName = (date: Date): string => {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return days[date.getDay()];
  };

  const formatMonthYear = (date: Date): string => {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
    });
  };

  const handleAddSchedule = () => {
    setIsScheduleModalVisible(true);
  };

  const handleScheduleSubmit = async (scheduleData: { 
    nickname: string; 
    startTime: Date;
    endTime: Date;
  }) => {
    try {
      const newSchedule: Schedule = {
        id: schedules.length + 1,
        nickname: scheduleData.nickname,
        startTime: scheduleData.startTime,
        endTime: scheduleData.endTime,
      };

      const updatedSchedules = [...schedules, newSchedule];
      await AsyncStorage.setItem('schedules', JSON.stringify(updatedSchedules));
      setSchedules(updatedSchedules);
      setIsScheduleModalVisible(false);
    } catch (error) {
      console.error('Failed to save schedule:', error);
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const toggleExpand = (id: number) => {
    const isExpanding = expandedCard !== id;
    setExpandedCard(isExpanding ? id : null);
  
    Animated.timing(animationHeight, {
      toValue: isExpanding ? 200 : 0, // 높이값 증가
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const weekDates = useMemo(() => {
    const dates: Date[] = [];
    const startDate = new Date(today);
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      dates.push(day);
    }
    return dates;
  }, [today]);

  const handleDeleteSchedule = async (scheduleId: number) => {
    try {
      const updatedSchedules = schedules.filter(schedule => schedule.id !== scheduleId);
      await AsyncStorage.setItem('schedules', JSON.stringify(updatedSchedules));
      setSchedules(updatedSchedules);
    } catch (error) {
      console.error('Failed to delete schedule:', error);
    }
  };

  // 진행중인 티켓 섹션
  const renderActiveTickets = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeaderContainer}>
        <Text style={styles.sectionTitle}>진행중</Text>
        {userRole === 'ROLE_TRAINER' && (
          <TouchableOpacity
            style={styles.addTicketButton}
            onPress={() => setIsTicketModalVisible(true)}
          >
            <Ionicons name="add-circle-outline" size={24} color="#0047FF" />
            <Text style={styles.addTicketButtonText}>이용권 추가</Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        horizontal
        pagingEnabled
        nestedScrollEnabled={true}
        showsHorizontalScrollIndicator={false}
        data={activeTickets}
        renderItem={({ item: ticket }) => (
          <View style={[
            styles.card,
            expandedCard === ticket.id ? styles.cardExpanded : styles.cardCollapsed
          ]}>
            <View style={styles.mainContent}>
              <View style={styles.cardHeader}>
                <View style={styles.statusContainer}>
                  <Text style={styles.status}>사용중</Text>
                </View>
              </View>

              <View style={styles.cardContent}>
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: '/api/placeholder/80/80' }}
                    style={styles.image}
                  />
                </View>

                <View style={styles.infoContainer}>
                  <Text style={styles.ptName}>{ticket.totalSessions}회 이용권</Text>
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>세션</Text>
                    <Text style={styles.value}>{ticket.usedSessions}/{ticket.totalSessions}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>시작일</Text>
                    <Text style={styles.value}>{formatDate(ticket.startDate)}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>트레이너</Text>
                    <Text style={styles.value}>{ticket.trainerName || '-'}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>회원</Text>
                    <Text style={styles.value}>{ticket.studentName || '-'}</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.cardFooter}>
              <TouchableOpacity
                style={styles.historyButton}
                onPress={() => toggleExpand(ticket.id)}
              >
                <View style={styles.historyButtonContent}>
                  <Text style={styles.historyButtonText}>세션 진행 현황</Text>
                  <Ionicons 
                    name={expandedCard === ticket.id ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color="#fff" 
                  />
                </View>
              </TouchableOpacity>

              {expandedCard === ticket.id && (
                <Animated.View style={[
                  styles.historyContainer,
                  {
                    maxHeight: animationHeight,
                    overflow: 'hidden',
                  }
                ]}>
                  <ScrollView 
                    style={styles.historyScroll}
                    nestedScrollEnabled={true}
                    scrollEventThrottle={16}
                    bounces={false}
                  >
                    {ticket.sessions.map((session) => (
                      <View key={session.id} style={styles.historyItem}>
                        <Text style={styles.sessionNumber}>{session.number}회</Text>
                        <View style={styles.sessionStatus}>
                          {session.trainerSigned && session.memberSigned ? (
                            <>
                              <Text style={styles.completedText}>완료</Text>
                              <Text style={styles.sessionDate}>
                                {formatSessionDateTime(session.startAt)}
                              </Text>
                            </>
                          ) : (
                            <Text style={styles.pendingText}>진행중</Text>
                          )}
                        </View>
                      </View>
                    ))}
                  </ScrollView>
                </Animated.View>
              )}
            </View>
          </View>
        )}
        keyExtractor={item => item.id.toString()}
        ListEmptyComponent={() => (
          <View style={styles.card}>
            <Text style={[styles.ptName, { textAlign: 'center', marginTop: 100 }]}>
              진행중인 이용권이 없습니다
            </Text>
          </View>
        )}
      />
    </View>
  );

  // 종료된 티켓 섹션
  const renderCompletedTickets = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>종료</Text>
      <FlatList
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        data={completedTickets}
        renderItem={({ item: ticket }) => (
          <View style={[
            styles.card,
            styles.completedCard,
            expandedCard === ticket.id ? styles.cardExpanded : styles.cardCollapsed
          ]}>
            <View style={styles.mainContent}>
              <View style={styles.cardHeader}>
                <View style={styles.statusContainer}>
                  <Text style={styles.status}>종료</Text>
                </View>
              </View>

              <View style={styles.cardContent}>
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: '/api/placeholder/80/80' }}
                    style={styles.image}
                  />
                </View>

                <View style={styles.infoContainer}>
                  <Text style={styles.ptName}>{ticket.totalSessions}회 이용권</Text>
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>세션</Text>
                    <Text style={styles.value}>{ticket.usedSessions}/{ticket.totalSessions}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>시작일</Text>
                    <Text style={styles.value}>{formatDate(ticket.startDate)}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>트레이너</Text>
                    <Text style={styles.value}>{ticket.trainerName || '-'}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>회원</Text>
                    <Text style={styles.value}>{ticket.studentName || '-'}</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.cardFooter}>
              <TouchableOpacity
                style={styles.historyButton}
                onPress={() => toggleExpand(ticket.id)}
              >
                <View style={styles.historyButtonContent}>
                  <Text style={styles.historyButtonText}>세션 진행 현황</Text>
                  <Ionicons 
                    name={expandedCard === ticket.id ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color="#fff" 
                  />
                </View>
              </TouchableOpacity>

              {expandedCard === ticket.id && (
                <Animated.View style={[
                  styles.historyContainer,
                  {
                    maxHeight: animationHeight,
                    overflow: 'hidden',
                  }
                ]}>
                  <ScrollView 
                    style={styles.historyScroll}
                    nestedScrollEnabled={true}
                    scrollEventThrottle={16}
                    bounces={false}
                  >
                    {ticket.sessions.map((session) => (
                      <View key={session.id} style={styles.historyItem}>
                        <Text style={styles.sessionNumber}>{session.number}회</Text>
                        <View style={styles.sessionStatus}>
                          {session.trainerSigned && session.memberSigned ? (
                            <>
                              <Text style={styles.completedText}>완료</Text>
                              <Text style={styles.sessionDate}>
                                {formatSessionDateTime(session.startAt)}
                              </Text>
                            </>
                          ) : (
                            <Text style={styles.pendingText}>진행중</Text>
                          )}
                        </View>
                      </View>
                    ))}
                  </ScrollView>
                </Animated.View>
              )}
            </View>
          </View>
        )}
        keyExtractor={item => item.id.toString()}
        ListEmptyComponent={() => (
          <View style={[styles.emptyContainer, { backgroundColor: '#808080' }]}>
            <Text style={styles.emptyText}>
              종료된 이용권이 없습니다
            </Text>
          </View>
        )}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopHeader />
      <View style={styles.container}>
        <ScrollView>
          <View style={styles.contentContainer}>
            {/* 월/연도 표시 */}
            <Text style={styles.monthTitle}>{formatMonthYear(selectedDate)}</Text>

            {/* 주간 달력 */}
            <View style={styles.weekHeader}>
              {weekDates.map((date, index) => {
                const isSelected = date.toDateString() === selectedDate.toDateString();
                const isToday = date.toDateString() === today.toDateString();

                return (
                  <TouchableOpacity 
                    key={index}
                    onPress={() => handleDateSelect(date)}
                    style={[
                      styles.dayCell,
                      isSelected && styles.selectedDay
                    ]}
                  >
                    <Text style={[
                      styles.dayText,
                      isSelected && styles.selectedDayText
                    ]}>{getDayName(date)}</Text>
                    <Text style={[
                      styles.dateText,
                      isSelected && styles.selectedDayText,
                      isToday && !isSelected && styles.todayText,
                      (isSelected && isToday) && styles.selectedTodayText
                    ]}>{date.getDate()}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* 일정 목록 */}
            {filteredSchedules.map((schedule) => (
              <View key={schedule.id} style={styles.scheduleItem}>
                <View style={styles.scheduleMarker} />
                <View style={styles.scheduleContent}>
                  <Text style={styles.scheduleTitle}>{schedule.nickname}</Text>
                  <Text style={styles.scheduleTime}>
                    {formatScheduleTime(schedule.startTime, schedule.endTime)}
                  </Text>
                </View>
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => handleDeleteSchedule(schedule.id)}
                >
                  <Ionicons name="close-circle" size={24} color="#FF6B6B" />
                </TouchableOpacity>
              </View>
            ))}

            {/* 일정이 없는 경우 */}
            {filteredSchedules.length === 0 && (
              <View style={styles.emptySchedule}>
                <Text style={styles.emptyScheduleText}>해당 날짜의 일정이 없습니다.</Text>
              </View>
            )}
            
            {/* 일정 추가 버튼 */}
            <View style={styles.plusButtonWrapper}>
              <PlusButton onPress={handleAddSchedule} />
            </View>

            {renderActiveTickets()}
            {renderCompletedTickets()}
          </View>
        </ScrollView>
      </View>

      <AddScheduleModal
        visible={isScheduleModalVisible}
        onClose={() => setIsScheduleModalVisible(false)}
        onSubmit={handleScheduleSubmit}
        selectedDate={selectedDate}
      />
      <AddTicketModal
        visible={isTicketModalVisible}
        onClose={() => setIsTicketModalVisible(false)}
        onSuccess={() => {
          loadTickets();
          setIsTicketModalVisible(false);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    paddingHorizontal: 20,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingVertical: 20,
  },
  weekHeader: {
    flexDirection: 'row',
    paddingBottom: 10,
    justifyContent: 'space-between',
  },
  dayCell: {
    alignItems: 'center',
    padding: 10,
    width: 45,
  },
  selectedDay: {
    backgroundColor: '#0047FF',
    borderRadius: 8,
  },
  dayText: {
    fontSize: 14,
    color: '#333',
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
    color: '#333',
  },
  selectedDayText: {
    color: '#fff',
  },
  todayText: {
    color: '#0047FF',
  },
  selectedTodayText: {
    color: '#fff',
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  scheduleMarker: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0047FF',
    marginRight: 15,
  },
  scheduleContent: {
    flex: 1,
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  scheduleTime: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  deleteButton: {
    padding: 8,
  },
  plusButtonWrapper: {
    alignItems: 'flex-end',
    paddingBottom: 10,
    marginRight: -15,
  },
  emptySchedule: {
    padding: 20,
    alignItems: 'center',
  },
  emptyScheduleText: {
    color: '#666',
    fontSize: 14,
  },
  sectionContainer: {
    marginTop: 20,
    marginBottom: 10,
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  addTicketButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  addTicketButtonText: {
    color: '#0047FF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  card: {
    width: WINDOW_WIDTH - 40,
    backgroundColor: '#FF6B6B',
    borderRadius: 15,
    overflow: 'hidden',
    marginRight: 0,
  },
  cardCollapsed: {
    height: 250,
  },
  cardExpanded: {
    height: 'auto',
  },
  completedCard: {
    backgroundColor: '#808080',
  },
  mainContent: {
    height: 200,
  },
  cardHeader: {
    padding: 10,
    paddingTop: 12,
    paddingBottom: 8,
  },
  statusContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  status: {
    color: '#FF6B6B',
    fontSize: 15,
    fontWeight: 'bold',
  },
  cardContent: {
    flexDirection: 'row',
    padding: 15,
    paddingTop: 0,
  },
  imageContainer: {
    marginRight: 15,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  infoContainer: {
    flex: 1,
  },
  ptName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  label: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.8,
  },
  value: {
    color: '#fff',
    fontSize: 14,
  },
  cardFooter: {
    width: '100%',
    position: 'absolute',  // 추가
    bottom: 0,            // 추가
    left: 0,              // 추가
  },
  historyButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
  },
  historyButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  historyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  historyContainer: {
    backgroundColor: '#fff',
    position: 'absolute',
    left: 0,
    right: 0,
    top: '100%', // 카드 아래에 위치하도록
    zIndex: 1,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  historyScroll: {
    maxHeight: 150,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sessionNumber: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  sessionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  completedText: {
    color: '#0047FF',
  },
  pendingText: {
    color: '#666',
  },
  sessionDate: {
    color: '#666',
    fontSize: 12,
  },
  emptyContainer: {
    width: WINDOW_WIDTH - 40,
    height: 250, // card와 동일한 높이로 수정
    backgroundColor: '#808080', // 종료된 카드와 동일한 색상
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20, // 양쪽 여백 추가
  },
  emptyText: {
    color: '#fff', // 텍스트 색상을 흰색으로
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ManageScreen;