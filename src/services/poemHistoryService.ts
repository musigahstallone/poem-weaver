
'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, query, orderBy, getDocs, serverTimestamp, type Timestamp } from 'firebase/firestore';

export interface PoemHistoryItem {
  id: string;
  userId: string;
  title: string; 
  poem: string; 
  createdAt: Timestamp;
}

export async function savePoemToHistory(
  userId: string,
  title: string,
  poemContent: string
): Promise<string | null> {
  if (!userId) {
    console.error("User ID is required to save poem to history.");
    return null;
  }
  try {
    const poemData = {
      userId,
      title,
      poem: poemContent,
      createdAt: serverTimestamp(),
    };
    // Firestore path: users/{userId}/poems/{poemId}
    const docRef = await addDoc(collection(db, 'users', userId, 'poems'), poemData);
    return docRef.id;
  } catch (error) {
    console.error("Error saving poem to history:", error);
    // Optionally, rethrow or return a more specific error object
    if (error instanceof Error) {
        throw new Error(`Failed to save poem: ${error.message}`);
    }
    throw new Error("An unknown error occurred while saving the poem.");
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
