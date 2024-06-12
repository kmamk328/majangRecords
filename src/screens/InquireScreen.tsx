import React, { useState, useEffect } from 'react';
// import { ScrollView, Box, Text, VStack } from 'gluestack-ui';
import { ScrollView, Box, Text, VStack } from 'native-base';
import { getFirestore, collection, query, orderBy, limit, getDocs, startAfter, getDoc, doc } from 'firebase/firestore';

const Tab1Screen = () => {
    const [games, setGames] = useState([]);
    const [lastDoc, setLastDoc] = useState(null);
    const [loading, setLoading] = useState(false);
    const firestore = getFirestore();

    useEffect(() => {
        fetchGames();
    }, []);

    const fetchGames = async () => {
        setLoading(true);
        const gamesRef = collection(firestore, 'games');
        let q = query(gamesRef, orderBy('createdAt'), limit(10));
        if (lastDoc) {
        q = query(gamesRef, orderBy('createdAt'), startAfter(lastDoc), limit(10));
    }
    const querySnapshot = await getDocs(q);
    const newGames = await Promise.all(querySnapshot.docs.map(async doc => {
    const data = doc.data();
    const members = await Promise.all(data.members.map(async memberId => {
        const memberDoc = await getDoc(doc(firestore, 'members', memberId));
        return memberDoc.data().name;
    }));
    return { id: doc.id, createdAt: data.createdAt, members };
    }));
    setGames([...games, ...newGames]);
    setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
    setLoading(false);
    };

    const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
        const paddingToBottom = 20;
        return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
    };

    return (
    <ScrollView
        onScroll={({ nativeEvent }) => {
            if (isCloseToBottom(nativeEvent) && !loading) {
            fetchGames();
        }
        }}
    scrollEventThrottle={400}
    >
    <VStack space={4} padding={4}>
        {games.map((game, index) => (
            <Box key={index} padding={4} borderWidth={1} borderRadius={4} borderColor="gray.200">
                <Text>Created At: {new Date(game.createdAt.seconds * 1000).toLocaleString()}</Text>
                <Text>Members: {game.members.join(', ')}</Text>
            </Box>
        ))}
        {loading && <Text>Loading...</Text>}
    </VStack>
    </ScrollView>
    );
};

export default Tab1Screen;
