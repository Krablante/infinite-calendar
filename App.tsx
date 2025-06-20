
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CalendarGrid } from './components/CalendarGrid';
import { ArchiveToggle } from './components/ArchiveToggle';
import { getISODateString, addDays, formatDateForDisplay, getDayOfWeek, getMonthName } from './utils/dateUtils';
import type { CalendarEntry, UserDocumentData } from './types';
import { auth, db, googleProvider, signInWithPopup, signOut, onAuthStateChanged, doc, setDoc, getDoc, type FirebaseUser } from './firebaseConfig';

const LoginModal: React.FC<{ onLogin: () => void }> = ({ onLogin }) => (
  <div className="fixed inset-0 bg-neutral-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-neutral-700 p-8 rounded-lg shadow-xl text-center max-w-md w-full">
      <h2 
        className="text-3xl font-bold mb-6 orbitron text-neutral-100 apply-wobble"
        style={{ textShadow: '0.5px 0.5px 0.1px var(--pencil-medium-gray)'}}
      >
        Access Your Dumb Records
      </h2>
      <button
        onClick={onLogin}
        className="orbitron flex items-center justify-center w-full px-6 py-4 rounded-md text-neutral-100 bg-neutral-800
                   hover:bg-neutral-700 transition-all duration-200 ease-in-out
                   focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-opacity-70 
                   text-lg rough-border apply-wobble shadow-md hover:shadow-lg"
      >
        <svg className="w-5 h-5 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48px" height="48px"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l0.002-0.002l6.19,5.238C39.704,36.152,44,30.608,44,24C44,22.659,43.862,21.35,43.611,20.083z"/></svg>
        Sign in with Google
      </button>
    </div>
  </div>
);

const App: React.FC = () => {
  const [allEntries, setAllEntries] = useState<Record<string, CalendarEntry>>({});
  // currentDisplayKey is now based on local date
  const [currentDisplayKey, setCurrentDisplayKey] = useState<string>(getISODateString(new Date()));
  const [showArchive, setShowArchive] = useState<boolean>(false);
  
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [dataLoading, setDataLoading] = useState<boolean>(true);

  const todayCellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (currentUser && !authLoading) {
      setDataLoading(true);
      const userEntriesRef = doc(db, 'users', currentUser.uid);
      getDoc(userEntriesRef).then(docSnap => {
        if (docSnap.exists()) {
          const userData = docSnap.data() as UserDocumentData;
          if (userData && userData.entries) {
            setAllEntries(userData.entries);
          } else {
            setAllEntries({});
          }
        } else {
          setAllEntries({});
        }
        setDataLoading(false);
      }).catch(error => {
        console.error("Error fetching user entries:", error);
        setAllEntries({});
        setDataLoading(false);
      });
    } else if (!currentUser && !authLoading) {
      setAllEntries({});
      setDataLoading(false);
    }
  }, [currentUser, authLoading]);
  
  // No longer need a separate useEffect to initialize currentDisplayKey, useState handles it.

  // Periodically check for local date changes (e.g., at local midnight)
  useEffect(() => {
    const intervalId = setInterval(() => {
      const newTodayKey = getISODateString(new Date()); // Now gets local date string
      setCurrentDisplayKey(prevDisplayKey => {
        if (newTodayKey !== prevDisplayKey) {
          return newTodayKey; // Update if different
        }
        return prevDisplayKey; // Otherwise, keep the same state
      });
    }, 60000); // Check every minute

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []); // Empty dependency array: set up interval once and let it run.

  useEffect(() => {
    if (!dataLoading && !authLoading && currentUser && todayCellRef.current) {
      todayCellRef.current.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    }
  }, [showArchive, currentDisplayKey, dataLoading, authLoading, currentUser]);


  const handleUpdateEntry = useCallback(async (dateKey: string, text: string) => {
    if (!currentUser) return;

    const newEntryData = { text };
    setAllEntries(prevEntries => ({
      ...prevEntries,
      [dateKey]: newEntryData
    }));

    const updatedEntries = { ...allEntries, [dateKey]: newEntryData };
     try {
      const userEntriesRef = doc(db, 'users', currentUser.uid);
      await setDoc(userEntriesRef, { entries: updatedEntries }, { merge: true });
    } catch (error) {
      console.error("Error saving entry to Firestore:", error);
    }
  }, [currentUser, allEntries]);

  const toggleArchive = useCallback(() => {
    setShowArchive(prev => !prev);
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Google Sign-In Error:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign Out Error:", error);
    }
  };
  
  const isLoading = authLoading || dataLoading;

  if (authLoading) {
     return (
      <div className="min-h-screen flex items-center justify-center spectral">
        <div className="animate-pulse text-2xl orbitron text-neutral-700" style={{ textShadow: '0.5px 0.5px 0px var(--pencil-light-gray)'}}>Authenticating Scribe...</div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginModal onLogin={handleLogin} />;
  }
  
  if (isLoading && currentUser) {
     return (
      <div className="min-h-screen flex items-center justify-center spectral">
        <div className="animate-pulse text-2xl orbitron text-neutral-700" style={{ textShadow: '0.5px 0.5px 0px var(--pencil-light-gray)'}}>Loading Sketches from Archive...</div>
      </div>
    );
  }

  const daysToDisplay: string[] = [];
  const activeWindowDays: string[] = [];

  for (let i = 0; i < 30; i++) {
    activeWindowDays.push(addDays(currentDisplayKey, i));
  }

  if (showArchive) {
    const archivedKeys = Object.keys(allEntries)
      .filter(key => key < currentDisplayKey) // String comparison works for YYYY-MM-DD
      .sort((a, b) => a.localeCompare(b)); // Sort keys chronologically
    daysToDisplay.push(...archivedKeys);
  }
  daysToDisplay.push(...activeWindowDays);

  // currentDisplayKey is YYYY-MM-DD local, parse it correctly for Date object
  const dateForHeader = new Date(currentDisplayKey + 'T00:00:00'); // Interprets YYYY-MM-DD as local
  const currentMonthName = getMonthName(dateForHeader);
  const currentYear = dateForHeader.getFullYear();

  return (
    <div 
      className="min-h-screen text-neutral-700 spectral flex flex-col items-center p-4 selection:bg-neutral-300 selection:text-neutral-900"
    >
      <header className="w-full max-w-7xl mb-8 text-center">
        <div className="flex justify-end w-full mb-2">
          {currentUser && (
            <button 
              onClick={handleLogout} 
              className="text-sm text-neutral-600 hover:text-neutral-800 spectral apply-wobble underline"
              style={{textShadow: '0.2px 0.2px 0.1px var(--pencil-light-gray)'}}
            >
              Sign Out Scribe
            </button>
          )}
        </div>
        <h1 
          className="text-5xl font-bold mb-2 orbitron text-neutral-800 tracking-wider apply-wobble"
          style={{ 
            textShadow: 
              '0.2px 0.2px 0.1px var(--pencil-medium-gray), ' +
              '-0.2px -0.2px 0.1px var(--pencil-light-gray), ' +
              '0.5px 0.5px 0.2px var(--pencil-dark-gray), ' +
              '1px 1px 1px rgba(107, 114, 128, 0.2)'
          }}
        >
          Bello, non Pace
        </h1>
        <p 
          className="text-lg text-neutral-600 spectral apply-wobble"
          style={{
            textShadow: 
              '0.2px 0.2px 0.1px var(--pencil-medium-gray), ' +
              '-0.2px -0.2px 0.1px var(--pencil-light-gray)'
          }}
        >
          The stars align for {currentMonthName} {currentYear}. Today's passage: {formatDateForDisplay(currentDisplayKey)} ({getDayOfWeek(currentDisplayKey)})
        </p>
        <div className="mt-6">
          <ArchiveToggle showArchive={showArchive} onToggle={toggleArchive} />
        </div>
      </header>
      
      <main className="w-full max-w-7xl">
        <CalendarGrid
          allEntries={allEntries}
          displayKeys={daysToDisplay}
          currentDisplayKey={currentDisplayKey}
          onUpdateEntry={handleUpdateEntry}
          todayCellRef={todayCellRef}
        />
      </main>

      <footer className="mt-12 text-center text-sm text-neutral-500 spectral">
        <p>&copy; {new Date().getFullYear()} Keepers of the Cosmic Record. All timelines observed.</p>
        <p>Tempus edax rerum. Carpe diem.</p>
      </footer>
    </div>
  );
};

export default App;
