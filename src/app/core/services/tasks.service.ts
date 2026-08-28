import { Inject, Injectable } from '@angular/core';
import {
  Firestore,
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  where
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { Observable } from 'rxjs';

export interface Task {
  id: string;
  uid: string;
  title: string;
  description?: string;
  completed?: boolean;
  createdAt?: { toDate: () => Date };
}

@Injectable({ providedIn: 'root' })
export class TasksService {
  constructor(@Inject('FIRESTORE') private readonly firestore: Firestore) {}

  getTasks(user: User): Observable<Task[]> {
    if (!user?.uid) {
      throw new Error('No hay un usuario autenticado para consultar tareas.');
    }

    const tasksCollection = collection(this.firestore, 'tasks');
    const tasksQuery = query(tasksCollection, where('uid', '==', user.uid));
    return new Observable<Task[]>((subscriber) => {
      const unsubscribe = onSnapshot(tasksQuery, (snapshot) => {
        const tasks = snapshot.docs
          .map((document) => ({ id: document.id, ...document.data() }) as Task)
          .sort((first, second) => this.getTimestamp(second) - this.getTimestamp(first));
        subscriber.next(tasks);
      }, (error) => subscriber.error(error));

      return unsubscribe;
    });
  }

  createTask(user: User, title: string, description: string): Promise<void> {
    if (!user?.uid) {
      return Promise.reject(new Error('No hay un usuario autenticado para crear tareas.'));
    }

    const cleanTitle = title.trim();
    if (!cleanTitle) {
      return Promise.reject(new Error('El título de la tarea es obligatorio.'));
    }

    const tasksCollection = collection(this.firestore, 'tasks');
    return addDoc(tasksCollection, {
      uid: user.uid,
      title: cleanTitle,
      description: description.trim(),
      completed: false,
      createdAt: serverTimestamp()
    }).then(() => undefined);
  }

  deleteTask(user: User, taskId: string): Promise<void> {
    if (!user?.uid) {
      return Promise.reject(new Error('No hay un usuario autenticado para eliminar tareas.'));
    }

    return deleteDoc(doc(this.firestore, 'tasks', taskId));
  }

  private getTimestamp(task: Task): number {
    return task.createdAt?.toDate().getTime() ?? 0;
  }
}
