import { useEffect, useState } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase'

// Real-time Firestore listener for a whole collection, ordered by a single
// field (single-field orderBy needs no composite index in Firestore).
export function useCollection(collectionName, { orderByField = 'createdAt', direction = 'desc' } = {}) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    const q = query(collection(db, collectionName), orderBy(orderByField, direction))
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setData(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
        setLoading(false)
        setError(null)
      },
      (err) => {
        setError(err)
        setLoading(false)
      }
    )
    return unsubscribe
  }, [collectionName, orderByField, direction])

  return { data, loading, error }
}
