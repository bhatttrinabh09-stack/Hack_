import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ScreenContainer } from '../components/ScreenContainer';
import { useStore } from '../store/useStore';
import { authApi } from '../api/client';
import { theme } from '../theme/theme';

export const AuthScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const setAuth = useStore((state) => state.setAuth);

  const handleQuickDemo = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);
    try {
      const data = await authApi.login('demo@adaptlearn.dev', 'password123');
      setSuccessMessage('Logged in as Demo User!');
      setTimeout(() => {
        setAuth(data.access_token, data.user);
      }, 300);
    } catch (e: any) {
      const msg =
        e.response?.data?.detail ||
        e.message ||
        'Could not connect to backend server. Make sure the backend is running at http://127.0.0.1:8000';
      setErrorMessage(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmedEmail = email.trim();
    const trimmedPass = password.trim();

    if (!trimmedEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    if (!trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setErrorMessage('Please enter a valid email address (e.g. name@example.com).');
      return;
    }

    const finalPass = trimmedPass || 'password123';

    setLoading(true);
    try {
      if (isLogin) {
        const data = await authApi.login(trimmedEmail, finalPass);
        setSuccessMessage('Login successful! Loading your dashboard...');
        setTimeout(() => {
          setAuth(data.access_token, data.user);
        }, 300);
      } else {
        const finalName = name.trim() || trimmedEmail.split('@')[0];
        const data = await authApi.signup(trimmedEmail, finalPass, finalName);
        setSuccessMessage('Account created successfully! You can now log in.');
        setIsLogin(true);
      }
    } catch (e: any) {
      let msg = 'Authentication failed. Please verify your credentials.';
      if (e.response?.data?.detail) {
        if (typeof e.response.data.detail === 'string') {
          msg = e.response.data.detail;
        } else if (Array.isArray(e.response.data.detail)) {
          msg = e.response.data.detail.map((err: any) => err.msg || err.detail).join(', ');
        }
      } else if (e.message) {
        msg = `Network error: ${e.message}. Is the backend running?`;
      }
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            {/* Header Branding */}
            <View style={styles.brandContainer}>
              <Text style={styles.logoIcon}>⚡</Text>
              <Text style={styles.title}>AdaptLearn</Text>
              <Text style={styles.subtitle}>Adaptive Exam Prep with AI Short Videos & Swipes</Text>
            </View>

            {/* Response Alerts for User Feedback */}
            {errorMessage && (
              <View style={styles.errorAlert}>
                <Text style={styles.alertIcon}>⚠️</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.alertTitle}>Action Failed</Text>
                  <Text style={styles.alertText}>{errorMessage}</Text>
                </View>
                <TouchableOpacity onPress={() => setErrorMessage(null)}>
                  <Text style={styles.dismissAlert}>✕</Text>
                </TouchableOpacity>
              </View>
            )}

            {successMessage && (
              <View style={styles.successAlert}>
                <Text style={styles.alertIcon}>✅</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.alertTitle}>Success</Text>
                  <Text style={styles.alertText}>{successMessage}</Text>
                </View>
              </View>
            )}

            {/* Quick Demo Login Action */}
            <TouchableOpacity
              style={styles.demoButton}
              onPress={handleQuickDemo}
              disabled={loading}
            >
              <Text style={styles.demoButtonText}>⚡ Quick One-Click Demo Login</Text>
              <Text style={styles.demoSubtext}>(alex / demo@adaptlearn.dev)</Text>
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with email</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Form Fields */}
            {!isLogin && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Alex Sharma"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={name}
                  onChangeText={(t) => {
                    setName(t);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  autoCapitalize="words"
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="student@university.edu"
                placeholderTextColor={theme.colors.textSecondary}
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  if (errorMessage) setErrorMessage(null);
                }}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter password (default: password123)"
                placeholderTextColor={theme.colors.textSecondary}
                value={password}
                onChangeText={(t) => {
                  setPassword(t);
                  if (errorMessage) setErrorMessage(null);
                }}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator color={theme.colors.text} size="small" />
                  <Text style={styles.buttonText}>
                    {isLogin ? 'Authenticating...' : 'Creating Account...'}
                  </Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>{isLogin ? 'Log In' : 'Sign Up'}</Text>
              )}
            </TouchableOpacity>

            {/* Switch Mode Toggle */}
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() => {
                setIsLogin(!isLogin);
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              disabled={loading}
            >
              <Text style={styles.toggleText}>
                {isLogin
                  ? "Don't have an account yet? Sign Up"
                  : 'Already registered? Log In'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  content: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  logoIcon: {
    fontSize: 40,
    marginBottom: theme.spacing.xs,
  },
  title: {
    fontSize: theme.typography.h1.fontSize,
    fontWeight: 'bold',
    color: theme.colors.primary,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: theme.typography.body2.fontSize,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
  },
  errorAlert: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: theme.colors.error,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },
  successAlert: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: theme.colors.success,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },
  alertIcon: {
    fontSize: 18,
    marginTop: 1,
  },
  alertTitle: {
    color: theme.colors.text,
    fontWeight: 'bold',
    fontSize: theme.typography.body2.fontSize,
    marginBottom: 2,
  },
  alertText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: 18,
  },
  dismissAlert: {
    color: theme.colors.textSecondary,
    fontWeight: 'bold',
    fontSize: 16,
    paddingHorizontal: 4,
  },
  demoButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    borderColor: theme.colors.primary,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  demoButtonText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
    fontSize: theme.typography.body1.fontSize,
  },
  demoSubtext: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption.fontSize,
    marginTop: 2,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.surface,
  },
  dividerText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption.fontSize,
    paddingHorizontal: theme.spacing.md,
  },
  inputGroup: {
    marginBottom: theme.spacing.md,
  },
  label: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption.fontSize,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: '#334155',
    fontSize: theme.typography.body1.fontSize,
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginTop: theme.spacing.md,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: theme.typography.body1.fontSize,
  },
  toggleButton: {
    marginTop: theme.spacing.xl,
    padding: theme.spacing.xs,
    alignItems: 'center',
  },
  toggleText: {
    color: theme.colors.primary,
    fontSize: theme.typography.body2.fontSize,
    fontWeight: '500',
  },
});

