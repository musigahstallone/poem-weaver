
'use server';

import { db } from '@/lib/firebase';
import type { GeneratePoemInput, GeneratePoemOutput } from '@/ai/flows/generate-poem';
import { collection, addDoc, query, where, orderBy, getDocs, serverTimestamp, type Timestamp } from 'firebase/firestore';

export interface PoemHistoryItem extends GeneratePoemInput {
  id: string;
  poem: string;
  userId: string;
  createdAt: Timestamp;
}

export async function savePoemToHistory(
  userId: string,
  input: GeneratePoemInput,
  output: GeneratePoemOutput
): Promise<string | null> {
  if (!userId) {
    console.error("User ID is required to save poem to history.");
    return null;
  }
  try {
    const poemData = {
      userId,
      theme: input.theme,
      style: input.style,
      poem: output.poem,
      createdAt: serverTimestamp(),
    };
    const docRef = await addDoc(collection(db, 'users', userId, 'poems'), poemData);
    return docRef.id;
  } catch (error) {
    console.error("Error saving poem to history:", error);
    return null;
  }
}

export async function getPoemsForUser(userId: string): Promise<PoemHistoryItem[]> {
  if (!userId) {
    console.error("User ID is required to fetch poem history.");
    return [];
  }
  try {
    const poemsRef = collection(db, 'users', userId, 'poems');
    const q = query(poemsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const poems: PoemHistoryItem[] = [];
    querySnapshot.forEach((doc) => {
      poems.push({ id: doc.id, ...doc.data() } as PoemHistoryItem);
    });
    return poems;
  } catch (error) {
    console.error("Error fetching poems for user:", error);
    return [];
  }
}
