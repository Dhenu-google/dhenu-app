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
                colors={['#4C6EF5', '#3B5BDB', '#364FC7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientBorder}
              />
              <View style={styles.modalContent}>
                <ThemedText type="subtitle" style={styles.modalTitle}>
                  Create a Post
                </ThemedText>

                <TextInput
                  style={styles.titleInput}
                  placeholder="Title"
                  placeholderTextColor="#777"
                  value={newPostTitle}
                  onChangeText={setNewPostTitle}
                  blurOnSubmit={false}
                />
                <TextInput
                  style={styles.composeInput}
                  placeholder="What's on your mind?"
                  placeholderTextColor="#777"
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
                    <ThemedText>Cancel</ThemedText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalButton, styles.postButton]}
                    disabled={!newPostTitle.trim() || !newPostContent.trim()}
                    onPress={createPost}
                  >
                    <ThemedText style={styles.postButtonText}>Post</ThemedText>
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
        orderBy("createdAt", "desc") // default: most recent from Firestore
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
    if (!newPostTitle.trim() || !newPostContent.trim() || !currentUser) return;

    try {
      const newPost = {
        title: newPostTitle,
        content: newPostContent,
        author: {
          id: currentUser.uid,
          name: currentUser.displayName || "Anonymous User",
        },
        likes: 0,
        dislikes: 0,
        createdAt: Timestamp.now(),
        likedBy: [],
        dislikedBy: [],
        replies: [],
      };

      await addDoc(collection(db, "posts"), newPost);

      // Reset fields
      setNewPostTitle("");
      setNewPostContent("");
      setShowComposeModal(false);

      // Refresh posts
      fetchPosts();
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  // Add reply to a post
  const addReply = async (postId: string) => {
    if (!replyContent.trim() || !currentUser) return;

    try {
      const postRef = doc(db, "posts", postId);
      const newReply = {
        id: Date.now().toString(),
        content: replyContent,
        author: {
          id: currentUser.uid,
          name: currentUser.displayName || "Anonymous User",
        },
        createdAt: Timestamp.now(),
      };

      const postToUpdate = posts.find((post) => post.id === postId);
      if (postToUpdate) {
        const updatedReplies = [...postToUpdate.replies, newReply];
        await updateDoc(postRef, { replies: updatedReplies });
        fetchPosts();
      }

      // Reset reply state
      setReplyContent("");
      setReplyingTo(null);
    } catch (error) {
      console.error("Error adding reply:", error);
    }
  };

  // Handle likes and dislikes
  const handleReaction = async (postId: string, type: "like" | "dislike") => {
    if (!currentUser) return;

    try {
      const postRef = doc(db, "posts", postId);
      const postToUpdate = posts.find((post) => post.id === postId);

      if (postToUpdate) {
        const userId = currentUser.uid;
        let likedBy = [...postToUpdate.likedBy];
        let dislikedBy = [...postToUpdate.dislikedBy];

        if (type === "like") {
          if (likedBy.includes(userId)) {
            // Remove like
            likedBy = likedBy.filter((id) => id !== userId);
            await updateDoc(postRef, { likedBy, likes: increment(-1) });
          } else {
            // Add like and remove dislike if exists
            likedBy.push(userId);
            if (dislikedBy.includes(userId)) {
              dislikedBy = dislikedBy.filter((id) => id !== userId);
              await updateDoc(postRef, {
                likedBy,
                dislikedBy,
                likes: increment(1),
                dislikes: increment(-1),
              });
            } else {
              await updateDoc(postRef, {
                likedBy,
                likes: increment(1),
              });
            }
          }
        } else {
          // Handle dislike
          if (dislikedBy.includes(userId)) {
            dislikedBy = dislikedBy.filter((id) => id !== userId);
            await updateDoc(postRef, { dislikedBy, dislikes: increment(-1) });
          } else {
            dislikedBy.push(userId);
            if (likedBy.includes(userId)) {
              likedBy = likedBy.filter((id) => id !== userId);
              await updateDoc(postRef, {
                dislikedBy,
                likedBy,
                dislikes: increment(1),
                likes: increment(-1),
              });
            } else {
              await updateDoc(postRef, {
                dislikedBy,
                dislikes: increment(1),
              });
            }
          }
        }

        // Refresh after reaction
        fetchPosts();
      }
    } catch (error) {
      console.error(`Error handling ${type}:`, error);
    }
  };

  // Toggle post selection
  const togglePostSelection = (postId: string) => {
    if (selectedPost === postId) {
      setSelectedPost(null);
    } else {
      setSelectedPost(postId);
      setReplyingTo(null); // Close any open reply box
    }
  };

  // Format date for display
  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  // Sort posts in memory based on the sortType
  const getSortedPosts = () => {
    const postsCopy = [...posts];

    switch (sortType) {
      case "mostOld":
        return postsCopy.sort(
          (a, b) =>
            a.createdAt.toDate().getTime() - b.createdAt.toDate().getTime()
        );

      case "mostLiked":
        return postsCopy.sort((a, b) => b.likes - a.likes);

      case "mostReplied":
        return postsCopy.sort((a, b) => b.replies.length - a.replies.length);

      case "mostRecent":
      default:
        return postsCopy.sort(
          (a, b) =>
            b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime()
        );
    }
  };

  // Get current sort label
  const getSortLabel = () => {
    switch (sortType) {
      case "mostOld": return "Oldest";
      case "mostLiked": return "Most Liked";
      case "mostReplied": return "Most Replies";
      case "mostRecent": 
      default: return "Recent";
    }
  };

  // Get sort icon
  const getSortIcon = (): any => {
    switch (sortType) {
      case "mostOld": return "timer-outline";
      case "mostLiked": return "heart";
      case "mostReplied": return "chatbubble-outline";
      case "mostRecent":
      default: return "timer";
    }
  };

  // Render a single post
  const renderPost = ({ item }: { item: Post }) => {
    const hasUserLiked = currentUser && item.likedBy.includes(currentUser.uid);
    const hasUserDisliked =
      currentUser && item.dislikedBy.includes(currentUser.uid);
      
    const isSelected = selectedPost === item.id;
    const hasReplies = item.replies.length > 0;

    return (
      <View style={styles.postContainer}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => togglePostSelection(item.id)}
          style={styles.postContentContainer}
        >
          <View style={styles.postHeader}>
            <ThemedText type="defaultSemiBold" style={styles.authorName}>{item.author.name}</ThemedText>
            <ThemedText style={styles.timestamp}>
              {formatDate(item.createdAt)}
            </ThemedText>
          </View>

          <ThemedText type="subtitle" style={styles.postTitle}>
            {item.title}
          </ThemedText>
          <ThemedText style={styles.postContent}>{item.content}</ThemedText>

          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={(e) => {
                e.stopPropagation();
                handleReaction(item.id, "like");
              }}
            >
              <Ionicons
                name={hasUserLiked ? "heart" : "heart-outline"}
                size={18}
                color={hasUserLiked ? "#F44336" : "#777"}
              />
              <ThemedText style={styles.actionCount}>{item.likes}</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={(e) => {
                e.stopPropagation();
                handleReaction(item.id, "dislike");
              }}
            >
              <Ionicons
                name={hasUserDisliked ? "thumbs-down" : "thumbs-down-outline"}
                size={18}
                color={hasUserDisliked ? "#3F51B5" : "#777"}
              />
              <ThemedText style={styles.actionCount}>
                {item.dislikes}
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={(e) => {
                e.stopPropagation();
                setReplyingTo(replyingTo === item.id ? null : item.id);
              }}
            >
              <Ionicons name="chatbubble-outline" size={18} color="#777" />
              <ThemedText style={styles.actionCount}>
                {item.replies.length}
              </ThemedText>
            </TouchableOpacity>
            
            {hasReplies && (
              <View style={styles.repliesIndicator}>
                <Ionicons 
                  name={isSelected ? "chevron-up" : "chevron-down"} 
                  size={16} 
                  color="#9370DB" 
                />
              </View>
            )}
          </View>
        </TouchableOpacity>

        {/* Reply section (show only if replyingTo === item.id) */}
        {replyingTo === item.id && (
          <View style={styles.replyContainer}>
            <TextInput
              style={styles.replyInput}
              placeholder="Write a reply..."
              placeholderTextColor="#777"
              value={replyContent}
              onChangeText={setReplyContent}
              multiline
            />
            <TouchableOpacity
              style={[styles.replyButton, !replyContent.trim() && styles.replyButtonDisabled]}
              onPress={() => addReply(item.id)}
              disabled={!replyContent.trim()}
            >
              <ThemedText style={styles.replyButtonText}>Reply</ThemedText>
            </TouchableOpacity>
          </View>
        )}

        {/* Existing replies - only show when post is selected */}
        {isSelected && hasReplies && (
          <View style={styles.repliesSection}>
            <ThemedText type="defaultSemiBold" style={styles.repliesHeader}>
              Replies
            </ThemedText>
            {item.replies.map((reply) => (
              <View key={reply.id} style={styles.reply}>
                <View style={styles.replyHeader}>
                  <ThemedText
                    type="defaultSemiBold"
                    style={styles.replyAuthor}
                  >
                    {reply.author.name}
                  </ThemedText>
                  <ThemedText style={styles.replyTimestamp}>
                    {formatDate(reply.createdAt)}
                  </ThemedText>
                </View>
                <ThemedText>{reply.content}</ThemedText>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const handleLogout = async () => {
    try {
      await signOut(); // Call the logout function
      console.log("User logged out successfully");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Add a header with back button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#8B5CF6" />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.headerTitle}>Forum</ThemedText>
        <View style={{width: 24}} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#4C6EF5" style={styles.loader} />
      ) : (
        <>
          <FlatList
            data={getSortedPosts()}
            renderItem={renderPost}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.postsList}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="chatbubbles-outline" size={64} color="#ccc" />
                <ThemedText style={styles.emptyText}>No posts yet</ThemedText>
                <ThemedText style={styles.emptySubtext}>
                  Be the first to start a conversation!
                </ThemedText>
              </View>
            }
          />

          {/* Floating Action Button to show Compose Modal */}
          <TouchableOpacity
            style={styles.composeButton}
            onPress={() => setShowComposeModal(true)}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>

          {/* Compose Modal Overlay */}
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
        </>
      )}
    </ThemedView>
  );
}

// ---------- Styles ----------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF"
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    paddingBottom: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8B5CF6',
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
    backgroundColor: "#F6F8FF",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E8EFFF"
  },
  sortIcon: {
    marginRight: 4
  },
  sortButtonText: {
    fontSize: 12,
    color: "#4C6EF5",
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
    borderColor: "#E8EFFF",
    backgroundColor: "#FFFFFF",
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
    backgroundColor: "#F6F8FF"
  },
  sortMenuItemText: {
    fontSize: 13,
    color: "#666",
    marginLeft: 8
  },
  sortMenuItemTextActive: {
    fontWeight: "600",
    color: "#4C6EF5"
  },
  postsList: {
    padding: 16,
    backgroundColor: "#FFFFFF"
  },
  postContainer: {
    borderRadius: 12,
    marginBottom: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#eaeaea",
    backgroundColor: "#FFFFFF",
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
    color: "#000000"
  },
  postContent: {
    marginBottom: 14,
    lineHeight: 21,
    fontSize: 15,
    color: "#333"
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
    backgroundColor: "#FFFFFF"
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    color: "#000000"
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
    backgroundColor: "#4C6EF5",
    borderRadius: 20
  },
  replyButtonText: {
    color: "white",
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
  replyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4
  },
  replyAuthor: {
    fontSize: 14,
    color: "#333"
  },
  replyTimestamp: {
    fontSize: 12,
    color: "#333"
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
    backgroundColor: "#FFFFFF"
  },
  modalTitle: {
    marginBottom: 16,
    textAlign: "center",
    fontSize: 18,
    color: "#4C6EF5"
  },
  titleInput: {
    borderWidth: 1,
    borderColor: "#E8EFFF",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
    color: "#000000"
  },
  composeInput: {
    borderWidth: 1,
    borderColor: "#E8EFFF",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: "top",
    backgroundColor: "#FFFFFF",
    color: "#000000"
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
    backgroundColor: "#f5f5f5"
  },
  postButton: {
    backgroundColor: "#4C6EF5"
  },
  postButtonText: {
    color: "white",
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
});

export { ComposeModal };
