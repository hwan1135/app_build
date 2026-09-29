import React, { useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const API_URL = "https://YOUR-BACKEND-DOMAIN.com/api/ask";

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
  citations?: string[];
};

export default function App() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: "Hi! Ask me anything and I’ll help find a clear answer.",
    },
  ]);

  async function askAI() {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion || loading) return;

    const userMessage: ChatMessage = {
      role: "user",
      text: trimmedQuestion,
    };

    setMessages((current) => [...current, userMessage]);
    setQuestion("");
    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: trimmedQuestion,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to get an answer.");
      }

      const data = await response.json();

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: data.answer || "I could not generate an answer.",
          citations: data.citations || [],
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Ask AI</Text>
        <Text style={styles.subtitle}>Friendly answers, clearly explained.</Text>
      </View>

      <ScrollView
        style={styles.chatArea}
        contentContainerStyle={styles.chatContent}
      >
        {messages.map((message, index) => (
          <View
            key={index}
            style={[
              styles.messageBubble,
              message.role === "user"
                ? styles.userBubble
                : styles.assistantBubble,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                message.role === "user"
                  ? styles.userText
                  : styles.assistantText,
              ]}
            >
              {message.text}
            </Text>

            {!!message.citations?.length && (
              <View style={styles.sources}>
                <Text style={styles.sourcesTitle}>Sources</Text>
                {message.citations.map((citation, citationIndex) => (
                  <Text key={citationIndex} style={styles.sourceText}>
                    • {citation}
                  </Text>
                ))}
              </View>
            )}
          </View>
        ))}

        {loading && (
          <View style={[styles.messageBubble, styles.assistantBubble]}>
            <ActivityIndicator color="#4F46E5" />
            <Text style={styles.thinkingText}>Thinking…</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputArea}>
        <TextInput
          value={question}
          onChangeText={setQuestion}
          placeholder="Ask a question..."
          placeholderTextColor="#8A8A8A"
          style={styles.input}
          multiline
          maxLength={1000}
        />

        <TouchableOpacity
          style={[
            styles.sendButton,
            (!question.trim() || loading) && styles.disabledButton,
          ]}
          onPress={askAI}
          disabled={!question.trim() || loading}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FC",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8EE",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1E1B4B",
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: "#6B7280",
  },
  chatArea: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
    gap: 12,
  },
  messageBubble: {
    maxWidth: "88%",
    borderRadius: 18,
    padding: 14,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#4F46E5",
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 4,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 23,
  },
  userText: {
    color: "#FFFFFF",
  },
  assistantText: {
    color: "#1F2937",
  },
  thinkingText: {
    marginTop: 8,
    color: "#6B7280",
  },
  sources: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  sourcesTitle: {
    fontWeight: "700",
    color: "#374151",
    marginBottom: 4,
  },
  sourceText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  inputArea: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    padding: 14,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E8E8EE",
  },
  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    fontSize: 16,
    color: "#111827",
  },
  sendButton: {
    backgroundColor: "#4F46E5",
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  disabledButton: {
    backgroundColor: "#A5A5B8",
  },
  sendButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});