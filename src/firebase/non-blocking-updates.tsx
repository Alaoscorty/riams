import {
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  CollectionReference,
  DocumentReference,
  SetOptions,
  DocumentData,
} from 'firebase/firestore';

import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export function setDocumentNonBlocking(
  docRef: DocumentReference,
  data: DocumentData,
  options?: SetOptions
) {
  setDoc(docRef, data, options).catch((error: any) => {
    if (error.code === 'permission-denied') {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: docRef.path,
          operation: 'write',
          requestResourceData: data,
        })
      );
    } else {
      console.error(error);
    }
  });
}

export function addDocumentNonBlocking(
  colRef: CollectionReference,
  data: DocumentData
) {
  return addDoc(colRef, data).catch((error: any) => {
    if (error.code === 'permission-denied') {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: colRef.path,
          operation: 'create',
          requestResourceData: data,
        })
      );
    } else {
      console.error(error);
    }
  });
}

export function updateDocumentNonBlocking(
  docRef: DocumentReference,
  data: DocumentData
) {
  updateDoc(docRef, data).catch((error: any) => {
    console.error(error);
  });
}

export function deleteDocumentNonBlocking(docRef: DocumentReference) {
  deleteDoc(docRef).catch((error: any) => {
    console.error(error);
  });
}