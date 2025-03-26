import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Button, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const addCowSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  breed: z.string().min(1, 'Breed is required'),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format'),
  tagNumber: z.string().optional(),
  notes: z.string().optional(),
  milkProduction: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Number(val)), 'Milk production must be a number'),
});

type AddCowFormData = z.infer<typeof addCowSchema>;

export default function AddCow() {
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<AddCowFormData>({
    resolver: zodResolver(addCowSchema),
    defaultValues: {
      name: '',
      breed: '',
      birthDate: '',
      tagNumber: '',
      notes: '',
      milkProduction: '0', // Default to 0
    },
  });

  const onSubmit = async (data: AddCowFormData) => {
    setLoading(true);

    try {
      const payload = {
        ...data,
        milkProduction: data.milkProduction ? parseFloat(data.milkProduction) : 0, // Default to 0
      };

      console.log('Adding cow:', payload);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      alert('Cow added successfully!');
      router.back();
    } catch (error) {
      console.error('Error adding cow:', error);
      alert('Failed to add cow. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.scrollView}>
          <Text style={styles.title}>Add New Cow</Text>
          
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <TextInput
                  label="Name"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  mode="outlined"
                  error={!!errors.name}
                />
                {errors.name && (
                  <Text style={styles.errorText}>{errors.name.message}</Text>
                )}
              </View>
            )}
          />
          
          <Controller
            control={control}
            name="breed"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <TextInput
                  label="Breed"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  mode="outlined"
                  error={!!errors.breed}
                />
                {errors.breed && (
                  <Text style={styles.errorText}>{errors.breed.message}</Text>
                )}
              </View>
            )}
          />
          
          <Controller
            control={control}
            name="birthDate"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <TextInput
                  label="Birth Date (YYYY-MM-DD)"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  mode="outlined"
                  error={!!errors.birthDate}
                  placeholder="YYYY-MM-DD"
                />
                {errors.birthDate && (
                  <Text style={styles.errorText}>{errors.birthDate.message}</Text>
                )}
              </View>
            )}
          />
          
          <Controller
            control={control}
            name="tagNumber"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <TextInput
                  label="Tag Number (Optional)"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  mode="outlined"
                />
              </View>
            )}
          />
          
          <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <TextInput
                  label="Notes (Optional)"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  mode="outlined"
                  multiline
                  numberOfLines={4}
                />
              </View>
            )}
          />
          
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleSubmit(onSubmit)}
              loading={loading}
              disabled={loading}
              style={styles.button}
            >
              Add Cow
            </Button>
            
            <Button
              mode="outlined"
              onPress={() => router.back()}
              style={[styles.button, styles.cancelButton]}
              disabled={loading}
            >
              Cancel
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 8,
  },
  buttonContainer: {
    marginTop: 10,
    marginBottom: 40,
  },
  button: {
    marginVertical: 8,
  },
  cancelButton: {
    marginTop: 8,
  },
});