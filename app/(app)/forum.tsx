import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
  PlatformColor,
  ColorValue,
  Modal
} from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import DhenuHeader from "@/components/DhenuHeader";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  Timestamp,
  getFirestore,
  query,
  orderBy,
  increment
} from "firebase/firestore";
import app from "@/lib/firebase-config";
import { getCurrentUser, FirebaseUserResponse } from "@/lib/firebase-service";
import { useFocusEffect } from "@react-navigation/native";
import { User } from "firebase/auth";
import { useSession } from "@/context"; // Import the custom hook for authentication
import { router } from "expo-router";
import { useTranslation } from "react-i18next"; // Import for translations

// Initialize Firestore
const db = getFirestore(app);

// Post type definition
interface Post {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
  };
  likes: number;
  dislikes: number;
  createdAt: Timestamp;
  likedBy: string[];
  dislikedBy: string[];
  replies: Reply[];
}

// Reply type definition
interface Reply {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
  };
  createdAt: Timestamp;
}

// Props for the Compose Modal
interface ComposeModalProps {
  newPostTitle: string;
  newPostContent: string;
  setNewPostTitle: (text: string) => void;
  setNewPostContent: (text: string) => void;
  setShowComposeModal: (show: boolean) => void;
  createPost: () => void;
}

// A custom overlay Compose Modal using ThemedView
const ComposeModal = React.memo(
  ({
    newPostTitle,
    newPostContent,
    setNewPostTitle,
    setNewPostContent,
    setShowComposeModal,
    createPost,
  }: ComposeModalProps) => {
    const { t } = useTranslation();
    
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={true}
        onRequestClose={() => setShowComposeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ width: "100%" }}
          >
            <View style={styles.gradientBorderContainer}>
              <LinearGradient
                colors={['#5D4037', '#5D4037', '#5D4037']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientBorder}
              />
              <View style={styles.modalContent}>
                <ThemedText type="subtitle" style={styles.modalTitle}>
                  {t('forum.createPost', 'Create a Post')}
                </ThemedText>

                <TextInput
                  style={styles.titleInput}
                  placeholder={t('forum.titlePlaceholder', 'Title')}
                  placeholderTextColor="#5D4037"
                  value={newPostTitle}
                  onChangeText={setNewPostTitle}
                  blurOnSubmit={false}
                />
                <TextInput
                  style={styles.composeInput}
                  placeholder={t('forum.contentPlaceholder', "What's on your mind?")}
                  placeholderTextColor="#5D4037"
                  value={newPostContent}
                  onChangeText={setNewPostContent}
                  multiline
                  blurOnSubmit={false}
                />

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setShowComposeModal(false)}
                  >
                    <ThemedText>{t('common.cancel', 'Cancel')}</ThemedText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalButton, styles.postButton]}
                    disabled={!newPostTitle.trim() || !newPostContent.trim()}
                    onPress={createPost}
                  >
                    <ThemedText style={styles.postButtonText}>{t('forum.post', 'Post')}</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    );
  }
);

export default function Forum() {
  const { user, signOut } = useSession(); // Access the user and logout function from the context
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  // Compose modal state
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostTitle, setNewPostTitle] = useState("");

  // Current user state
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Reply state
  const [replyContent, setReplyContent] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  
  // Track selected post for showing replies
  const [selectedPost, setSelectedPost] = useState<string | null>(null);

  // Sort state
  const [sortType, setSortType] = useState<
    "mostRecent" | "mostOld" | "mostLiked" | "mostReplied"
  >("mostRecent");
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const userResponse = (await getCurrentUser()) as FirebaseUserResponse | null;
      setCurrentUser(userResponse?.user || null);
    };
    getUser();
  }, []);

  // Fetch posts when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchPosts();
      return () => {};
    }, [])
  );

  // Fetch posts from Firestore
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const postsQuery = query(
        collection(db, "posts"),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(postsQuery);
      const fetchedPosts: Post[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data() as Omit<Post, "id">;
        fetchedPosts.push({
          id: doc.id,
          ...data,
          replies: data.replies || [],
        });
      });

      setPosts(fetchedPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  // Create a new post
  const createPost = async () => {
    if (!user || !newPostTitle.trim() || !newPostContent.trim()) return;

    try {
      await addDoc(collection(db, "posts"), {
        title: newPostTitle,
        content: newPostContent,
        author: {
          id: user.uid,
          name: user.displayName || t('forum.anonymousUser', 'Anonymous User'),
        },
        likes: 0,
        dislikes: 0,
        createdAt: Timestamp.now(),
        likedBy: [],
        dislikedBy: [],
        replies: [],
      });

      setNewPostTitle("");
      setNewPostContent("");
      setShowComposeModal(false);
      await fetchPosts();
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  // Add a reply to a post
  const addReply = async (postId: string) => {
    if (!user || !replyContent.trim()) return;

    try {
      const postRef = doc(db, "posts", postId);
      const postToUpdate = posts.find((p) => p.id === postId);

      if (!postToUpdate) return;

      const newReply = {
        id: `reply-${Date.now()}`,
        content: replyContent,
        author: {
          id: user.uid,
          name: user.displayName || t('forum.anonymousUser', 'Anonymous User'),
        },
        createdAt: Timestamp.now(),
      };

      const updatedReplies = [...postToUpdate.replies, newReply];

      await updateDoc(postRef, {
        replies: updatedReplies,
      });

      setReplyContent("");
      setReplyingTo(null);
      await fetchPosts();
    } catch (error) {
      console.error("Error adding reply:", error);
    }
  };

  // Handle like/dislike reactions
  const handleReaction = async (postId: string, type: "like" | "dislike") => {
    if (!user) {
      alert(t('forum.loginToReact', 'Please log in to react to posts.'));
      return;
    }

    try {
      const postRef = doc(db, "posts", postId);
      const post = posts.find((p) => p.id === postId);

      if (!post) return;

      const userId = user.uid;
      const alreadyLiked = post.likedBy.includes(userId);
      const alreadyDisliked = post.dislikedBy.includes(userId);

      let likesChange = 0;
      let dislikesChange = 0;
      let newLikedBy = [...post.likedBy];
      let newDislikedBy = [...post.dislikedBy];

      if (type === "like") {
        if (alreadyLiked) {
          // Unlike
          newLikedBy = newLikedBy.filter((id) => id !== userId);
          likesChange = -1;
        } else {
          // Like
          newLikedBy.push(userId);
          likesChange = 1;

          // Remove dislike if exists
          if (alreadyDisliked) {
            newDislikedBy = newDislikedBy.filter((id) => id !== userId);
            dislikesChange = -1;
          }
        }
      } else if (type === "dislike") {
        if (alreadyDisliked) {
          // Remove dislike
          newDislikedBy = newDislikedBy.filter((id) => id !== userId);
          dislikesChange = -1;
        } else {
          // Dislike
          newDislikedBy.push(userId);
          dislikesChange = 1;

          // Remove like if exists
          if (alreadyLiked) {
            newLikedBy = newLikedBy.filter((id) => id !== userId);
            likesChange = -1;
          }
        }
      }

      await updateDoc(postRef, {
        likes: increment(likesChange),
        dislikes: increment(dislikesChange),
        likedBy: newLikedBy,
        dislikedBy: newDislikedBy,
      });

      // Update local state to avoid refetching
      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p.id === postId
            ? {
                ...p,
                likes: p.likes + likesChange,
                dislikes: p.dislikes + dislikesChange,
                likedBy: newLikedBy,
                dislikedBy: newDislikedBy,
              }
            : p
        )
      );
    } catch (error) {
      console.error("Error handling reaction:", error);
    }
  };

  // Toggle the selected post to show/hide replies
  const togglePostSelection = (postId: string) => {
    setSelectedPost((prev) => (prev === postId ? null : postId));
    // Reset the replying state if we're closing the post or switching to a different one
    if (replyingTo !== postId) {
      setReplyingTo(null);
      setReplyContent("");
    }
  };

  // Format the timestamp for display
  const formatDate = (timestamp: Timestamp) => {
    const date = timestamp.toDate();
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  // Get posts sorted by the selected sort type
  const getSortedPosts = () => {
    const sortedPosts = [...posts];

    switch (sortType) {
      case "mostRecent":
        return sortedPosts.sort(
          (a, b) => b.createdAt.seconds - a.createdAt.seconds
        );
      case "mostOld":
        return sortedPosts.sort(
          (a, b) => a.createdAt.seconds - b.createdAt.seconds
        );
      case "mostLiked":
        return sortedPosts.sort((a, b) => b.likes - a.likes);
      case "mostReplied":
        return sortedPosts.sort((a, b) => b.replies.length - a.replies.length);
      default:
        return sortedPosts;
    }
  };

  // Get a human-readable label for the current sort type
  const getSortLabel = () => {
    switch (sortType) {
      case "mostRecent":
        return t('forum.sortByRecent', 'Most Recent');
      case "mostOld":
        return t('forum.sortByOldest', 'Oldest First');
      case "mostLiked":
        return t('forum.sortByLikes', 'Most Liked');
      case "mostReplied":
        return t('forum.sortByReplies', 'Most Replied');
    }
  };

  // Get the appropriate icon for the current sort type
  const getSortIcon = (): any => {
    switch (sortType) {
      case "mostRecent":
        return "time-outline";
      case "mostOld":
        return "calendar-outline";
      case "mostLiked":
        return "heart-outline";
      case "mostReplied":
        return "chatbox-outline";
    }
  };

  // Render a post item
  const renderPost = ({ item }: { item: Post }) => {
    const isSelected = selectedPost === item.id;
    const isReplying = replyingTo === item.id;
    const hasUserLiked = user && item.likedBy.includes(user.uid);
    const hasUserDisliked = user && item.dislikedBy.includes(user.uid);

    return (
      <TouchableOpacity
        style={styles.postContainer}
        onPress={() => togglePostSelection(item.id)}
        activeOpacity={0.8}
      >
        {/* Post Header */}
        <View style={styles.postHeader}>
          <View style={styles.postAuthorContainer}>
            <Ionicons
              name="person-circle-outline"
              size={24}
              color="#5D4037"
              style={styles.postAuthorIcon}
            />
            <ThemedText style={styles.postAuthor}>{item.author.name}</ThemedText>
          </View>
          <ThemedText style={styles.postTime}>
            {formatDate(item.createdAt)}
          </ThemedText>
        </View>

        {/* Post Title */}
        <ThemedText style={styles.postTitle}>{item.title}</ThemedText>

        {/* Post Content */}
        <ThemedText style={styles.postContent}>{item.content}</ThemedText>

        {/* Post Stats */}
        <View style={styles.postStats}>
          {/* Like Button */}
          <TouchableOpacity
            style={styles.reactionButton}
            onPress={(e) => {
              e.stopPropagation();
              handleReaction(item.id, "like");
            }}
          >
            <Ionicons
              name={hasUserLiked ? "heart" : "heart-outline"}
              size={20}
              color={hasUserLiked ? "#5D4037" : "#5D4037"}
            />
            <ThemedText style={[styles.reactionCount, hasUserLiked ? styles.activeReaction : null]}>
              {item.likes}
            </ThemedText>
          </TouchableOpacity>

          {/* Dislike Button */}
          <TouchableOpacity
            style={styles.reactionButton}
            onPress={(e) => {
              e.stopPropagation();
              handleReaction(item.id, "dislike");
            }}
          >
            <Ionicons
              name={hasUserDisliked ? "thumbs-down" : "thumbs-down-outline"}
              size={20}
              color={hasUserDisliked ? "#5D4037" : "#5D4037"}
            />
            <ThemedText style={[styles.reactionCount, hasUserDisliked ? styles.activeDislike : null]}>
              {item.dislikes}
            </ThemedText>
          </TouchableOpacity>

          {/* Reply Counter */}
          <View style={styles.reactionButton}>
            <Ionicons name="chatbox-outline" size={20} color="#5D4037" />
            <ThemedText style={styles.reactionCount}>
              {item.replies.length}
            </ThemedText>
          </View>

          {/* Reply Toggle */}
          <TouchableOpacity
            style={styles.replyButton}
            onPress={(e) => {
              e.stopPropagation();
              setSelectedPost(item.id);
              setReplyingTo(replyingTo === item.id ? null : item.id);
              if (replyingTo !== item.id) {
                setReplyContent("");
              }
            }}
          >
            <ThemedText style={styles.replyButtonText}>
              {isReplying ? t('forum.cancel', 'Cancel') : t('forum.reply', 'Reply')}
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Replies Section - only show if post is selected */}
        {isSelected && (
          <View style={styles.repliesSection}>
            {item.replies.length > 0 ? (
              item.replies.map((reply) => (
                <View key={reply.id} style={styles.replyItem}>
                  <View style={styles.replyHeader}>
                    <ThemedText style={styles.replyAuthor}>
                      {reply.author.name}
                    </ThemedText>
                    <ThemedText style={styles.replyTime}>
                      {formatDate(reply.createdAt)}
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.replyContent}>
                    {reply.content}
                  </ThemedText>
                </View>
              ))
            ) : (
              <ThemedText style={styles.noReplies}>
                {t('forum.noReplies', 'No replies yet. Be the first to reply!')}
              </ThemedText>
            )}

            {/* Reply Input - only show if reply button was clicked */}
            {isReplying && (
              <View style={styles.replyInputContainer}>
                <TextInput
                  style={styles.replyInput}
                  placeholder={t('forum.writeReplyPlaceholder', "Write a reply...")}
                  value={replyContent}
                  onChangeText={setReplyContent}
                  multiline
                  placeholderTextColor="#5D4037"
                />
                <TouchableOpacity
                  style={[
                    styles.submitReplyButton,
                    !replyContent.trim() && styles.disabledButton,
                  ]}
                  disabled={!replyContent.trim()}
                  onPress={() => addReply(item.id)}
                >
                  <ThemedText style={styles.submitReplyText}>
                    {t('forum.submit', 'Submit')}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <DhenuHeader title="Forum" />
      
      {/* Sorting Dropdown */}
      <View style={styles.sortingContainer}>
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setShowSortDropdown(!showSortDropdown)}
        >
          <Ionicons name={getSortIcon()} size={18} color="#5D4037" />
          <ThemedText style={styles.sortButtonText}>{getSortLabel()}</ThemedText>
          <Ionicons
            name={showSortDropdown ? "chevron-up" : "chevron-down"}
            size={18}
            color="#5D4037"
          />
        </TouchableOpacity>

        {showSortDropdown && (
          <View style={styles.sortDropdown}>
            <TouchableOpacity
              style={styles.sortOption}
              onPress={() => {
                setSortType("mostRecent");
                setShowSortDropdown(false);
              }}
            >
              <Ionicons name="time-outline" size={18} color="#5D4037" />
              <ThemedText style={styles.sortOptionText}>
                {t('forum.sortByRecent', 'Most Recent')}
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sortOption}
              onPress={() => {
                setSortType("mostOld");
                setShowSortDropdown(false);
              }}
            >
              <Ionicons name="calendar-outline" size={18} color="#5D4037" />
              <ThemedText style={styles.sortOptionText}>
                {t('forum.sortByOldest', 'Oldest First')}
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sortOption}
              onPress={() => {
                setSortType("mostLiked");
                setShowSortDropdown(false);
              }}
            >
              <Ionicons name="heart-outline" size={18} color="#5D4037" />
              <ThemedText style={styles.sortOptionText}>
                {t('forum.sortByLikes', 'Most Liked')}
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sortOption}
              onPress={() => {
                setSortType("mostReplied");
                setShowSortDropdown(false);
              }}
            >
              <Ionicons name="chatbox-outline" size={18} color="#5D4037" />
              <ThemedText style={styles.sortOptionText}>
                {t('forum.sortByReplies', 'Most Replied')}
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Post List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5D4037" />
          <ThemedText style={styles.loadingText}>{t('common.loading', 'Loading...')}</ThemedText>
        </View>
      ) : (
        <FlatList
          data={getSortedPosts()}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.postsList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={48} color="#aaa" />
              <ThemedText style={styles.emptyText}>
                {t('forum.noPosts', 'No posts yet. Be the first to start a discussion!')}
              </ThemedText>
            </View>
          }
        />
      )}

      {/* Floating Create Post Button */}
      <TouchableOpacity
        style={styles.createPostButton}
        onPress={() => {
          if (!user) {
            alert(t('forum.loginToPost', 'Please log in to create a post.'));
            return;
          }
          setShowComposeModal(true);
        }}
      >
        <LinearGradient
          colors={['#5D4037', '#5D4037', '#5D4037']}
          style={styles.gradientButton}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Compose Modal */}
      {showComposeModal && (
        <ComposeModal
          newPostTitle={newPostTitle}
          newPostContent={newPostContent}
          setNewPostTitle={setNewPostTitle}
          setNewPostContent={setNewPostContent}
          setShowComposeModal={setShowComposeModal}
          createPost={createPost}
        />
      )}
    </ThemedView>
  );
}

// ---------- Styles ----------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#faebd7"
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    paddingBottom: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#5D4037',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#5D4037',
  },
  backButton: {
    padding: 4,
  },
  loader: {
    flex: 1
  },
  postContentContainer: {
    width: '100%'
  },
  // Sort dropdown styles
  sortDropdownContainer: {
    position: "relative",
    zIndex: 10
  },
  sortDropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#faebd7",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#5D4037"
  },
  sortIcon: {
    marginRight: 4
  },
  sortButtonText: {
    fontSize: 12,
    color: '#5D4037',
    fontWeight: "500",
    marginRight: 4
  },
  sortDropdownMenu: {
    position: "absolute",
    top: "100%",
    right: 0,
    width: 140,
    marginTop: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#5D4037',
    backgroundColor: "#faebd7",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000
  },
  sortMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12
  },
  sortMenuItemActive: {
    backgroundColor: "#faebd7"
  },
  sortMenuItemText: {
    fontSize: 13,
    color: '#5D4037',
    marginLeft: 8
  },
  sortMenuItemTextActive: {
    fontWeight: "600",
    color: '#5D4037'
  },
  postsList: {
    padding: 16,
    backgroundColor: "#faebd7"
  },
  postContainer: {
    borderRadius: 12,
    marginBottom: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#5D4037',
    backgroundColor: "#faebd7",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10
  },
  authorName: {
    color: "#000000",
    fontSize: 15,
    fontWeight: "700"
  },
  timestamp: {
    fontSize: 12,
    color: "#333"
  },
  postTitle: {
    marginBottom: 8,
    lineHeight: 22,
    fontSize: 16,
    fontWeight: "600",
    color: '#5D4037'
  },
  postContent: {
    marginBottom: 14,
    lineHeight: 21,
    fontSize: 15,
    color: '#5D4037'
  },
  actionsRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#f5f5f5",
    paddingTop: 10,
    justifyContent: "space-around",
    alignItems: "center"
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 8
  },
  actionCount: {
    marginLeft: 4,
    fontSize: 13,
    color: "#777"
  },
  repliesIndicator: {
    marginLeft: 8
  },
  composeButton: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#4C6EF5",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#4C6EF5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    backgroundColor: "#faebd7"
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    color: '#5D4037'
  },
  emptySubtext: {
    fontSize: 14,
    color: "#333",
    marginTop: 8,
    textAlign: "center"
  },
  replyContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f5f5f5"
  },
  replyInput: {
    borderWidth: 1,
    borderColor: "#E8EFFF",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: "top",
    marginBottom: 8,
    backgroundColor: "#FFFFFF",
    color: "#000000"
  },
  replyButton: {
    alignSelf: "flex-end",
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#5D4037',
    borderRadius: 20
  },
  replyButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold"
  },
  repliesSection: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f5f5f5",
    paddingTop: 12
  },
  repliesHeader: {
    marginBottom: 8,
    color: "#000000"
  },
  reply: {
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8
  },
  replyItem: {
    backgroundColor: "#faebd7",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#5D4037",
  },
  replyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  replyTime: {
    fontSize: 12,
    color: "#5D4037",
  },
  replyContent: {
    fontSize: 14,
    color: "#5D4037",
    marginTop: 4,
  },
  // ---------- Compose Modal Overlay ----------
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20
  },
  gradientBorderContainer: {
    position: 'relative',
    width: '100%',
    borderRadius: 16,
    padding: 3,
    overflow: 'hidden'
  },
  gradientBorder: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 16
  },
  modalContent: {
    width: "100%",
    borderRadius: 14,
    padding: 20,
    backgroundColor: "#faebd7"
  },
  modalTitle: {
    marginBottom: 16,
    textAlign: "center",
    fontSize: 18,
    color: '#5D4037'
  },
  titleInput: {
    borderWidth: 1,
    borderColor: '#5D4037',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: "#faebd7",
    color: '#5D4037'
  },
  composeInput: {
    borderWidth: 1,
    borderColor: '#5D4037',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: "top",
    backgroundColor: "#faebd7",
    color: '#5D4037'
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    width: "48%",
    alignItems: "center"
  },
  cancelButton: {
    backgroundColor: "#faebd7",
    borderWidth: 1,
    borderColor: '#5D4037'
  },
  postButton: {
    backgroundColor: '#5D4037'
  },
  postButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold"
  },
  replyButtonDisabled: {
    backgroundColor: "#B0BEC5",
    opacity: 0.7
  },
  filterOption: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: "#f5f5f5"
  },
  filterOptionText: {
    fontSize: 14,
    color: "#333"
  },
  filterOptionActive: {
    backgroundColor: "#E8EFFF"
  },
  filterOptionTextActive: {
    color: "#000000"
  },
  postFooter: {
    flexDirection: "row",
    alignItems: "center"
  },
  footerItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16
  },
  footerText: {
    fontSize: 12,
    color: "#333",
    marginLeft: 4
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E8EFFF",
    backgroundColor: "#F6F8FF",
  },
  logoutText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#4C6EF5",
    fontWeight: "500",
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortingContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#5D4037',
    zIndex: 100,
    backgroundColor: '#faebd7',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#5D4037',
    backgroundColor: '#faebd7',
  },
  sortDropdown: {
    position: 'absolute',
    top: '100%',
    left: 10,
    zIndex: 1000,
    width: 200,
    backgroundColor: '#faebd7',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#5D4037',
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  sortOptionText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#5D4037',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#faebd7',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#5D4037',
  },
  createPostButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#5D4037',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#5D4037',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  gradientButton: {
    width: '100%',
    height: '100%',
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#5D4037',
  },
  postAuthorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postAuthorIcon: {
    marginRight: 10,
  },
  postAuthor: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5D4037',
  },
  postTime: {
    fontSize: 12,
    color: '#5D4037',
  },
  postStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: 10,
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reactionCount: {
    marginLeft: 4,
    fontSize: 14,
    color: '#5D4037',
  },
  activeReaction: {
    color: '#5D4037',
  },
  activeDislike: {
    color: '#5D4037',
  },
  replyInputContainer: {
    marginTop: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#5D4037',
    borderRadius: 8,
    backgroundColor: '#faebd7',
  },
  submitReplyButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#5D4037',
    alignItems: 'center',
  },
  submitReplyText: {
    color: "#FFFFFF",
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#5D4037',
    opacity: 0.7,
  },
  noReplies: {
    textAlign: 'center',
    color: '#5D4037',
  },
  replyAuthor: {
    fontSize: 14,
    fontWeight: "600",
    color: "#5D4037",
  },
});

export { ComposeModal };
