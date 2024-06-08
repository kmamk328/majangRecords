import React, { useState, useEffect, useLayoutEffect } from 'react';
import { ScrollView } from 'native-base';
import { TextInput, StyleSheet } from 'react-native';

import { View, VStack, Text, Button, Modal, Box, Select, Switch, HStack } from 'native-base';
import { useNavigation, useRoute } from '@react-navigation/native';
import { db } from '../../firebaseConfig';
import { getFirestore, collection, addDoc, doc, updateDoc, getDoc, getDocs, query, orderBy } from 'firebase/firestore';

const ScoreInputScreen = () => {
  const [currentRound, setCurrentRound] = useState({
    discarder: '',
    discarderPoints: '',
    isNaki: false,
    isReach: false,
    roundNumber: { round: '1', place: '東', honba: '0' },
    winner: '',
    winnerPoints: '',
    isTsumo: false,
    roles: []
  });
  const [members, setMembers] = useState([]);
  const [rolesOptions, setRolesOptions] = useState([
    { role: 'リーチ'                         , points: 1 },
    { role: '一発(イッパツ)'                  , points: 1 },
    { role: 'ツモ'                           , points: 1 },
    { role: '平和(ピンフ)'                    , points: 1 },
    { role: '断么九(タンヤオ)'                , points: 1 },
    { role: '飜牌(ファンパイ)/役牌(やくはい)'  , points: 1 },
    { role: '一盃口(イーペーコー)'            , points: 1 },
    { role: '嶺上開花(リンシャンカイホー)'     , points: 1 },
    { role: '槍槓(チャンカン)'                , points: 1 },
    { role: '海底(ハイテイ)/河底(ホーテイ)'    , points: 1 },
    { role: 'ダブルリーチ'                    , points: 1 },
    { role: '三色同順(サンショクドウジュン)'   , points: 1 },
    { role: '三色同刻(サンショクドウコー)'     , points: 1 },
    { role: '一気通貫(イッキツウカン)'        , points: 1 },
    { role: '対々和(トイトイホー)'            , points: 1 },
    { role: '三暗刻(サンアンコー)'            , points: 1 },
    { role: '三槓子(サンカンツ)'              , points: 1 },
    { role: '全帯么(チャンタ)'                , points: 1 },
    { role: '混老頭(ホンロートー)'            , points: 1 },
    { role: '小三元(ショウサンゲン)'           , points: 1 },
    { role: '七対子(チートイツ)'             , points: 1 },
    { role: '二盃口(リャンペーコー)'           , points: 1 },
    { role: '混一色(ホンイツ)'             , points: 1 },
    { role: '純全帯么(ジュンチャンタ)'             , points: 1 },
    { role: '清一色（チンイツ）'             , points: 1 },
  ]);
  const [availablePoints, setAvailablePoints] = useState([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  const [filteredPoints, setFilteredPoints] = useState([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [rounds, setRounds] = useState([]);
  const navigation = useNavigation();
  const route = useRoute();
  const { gameId } = route.params;
  const [isTsumo, setIsTsumo] = useState(false);
  const [isNaki, setIsNaki] = useState(false);
  const [isReach, setIsReach] = useState(false);
  const [discarder, setDiscarder] = useState('');
  const [discarderPoints, setDiscarderPoints] = useState('');
  const firestore = getFirestore();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: '#E0F8E0',
      },
      headerTintColor: '#000',
      headerTitle: 'スコア入力',
    });
  }, [navigation]);

  useEffect(() => {
    const fetchMembers = async () => {
      const gameDoc = await getDoc(doc(db, 'games', gameId));
      const memberIds = gameDoc.data().members;
      const memberNames = [];
      for (const memberId of memberIds) {
        const memberDoc = await getDoc(doc(db, 'members', memberId));
        memberNames.push({ id: memberId, name: memberDoc.data().name });
      }
      setMembers(memberNames);
    };

    const fetchRounds = async () => {
      const roundsRef = collection(db, 'games', gameId, 'rounds');
      const roundsQuery = query(roundsRef, orderBy('roundNumber'));
      const roundsSnapshot = await getDocs(roundsQuery);
      const roundsData = roundsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRounds(roundsData);
      if (roundsData.length > 0) {
        setCurrentRound(roundsData[0]);
        setCurrentRoundIndex(0);
      }
    };

    fetchMembers();
    fetchRounds();
  }, [gameId]);

  const handleChange = (key, value) => {
    setCurrentRound({ ...currentRound, [key]: value });
  };

  const handleRoundNumberChange = (key, value) => {
    setCurrentRound({
      ...currentRound,
      roundNumber: {
        ...currentRound.roundNumber,
        [key]: value
      }
    });
  };

  const toggleRoleSelection = (role) => {
    const updatedRoles = selectedRoles.includes(role)
      ? selectedRoles.filter(r => r !== role)
      : [...selectedRoles, role];
    setSelectedRoles(updatedRoles);
    updateFilteredPoints(updatedRoles);
  };

  const updateFilteredPoints = (updatedRoles) => {
    const totalPoints = updatedRoles.reduce((sum, role) => {
      const roleObj = rolesOptions.find(r => r.role === role);
      return sum + (roleObj ? roleObj.points : 0);
    }, 0);

    let newFilteredPoints = availablePoints;
    if (totalPoints >= 2) {
      newFilteredPoints = newFilteredPoints.filter(point => point >= 2000);
    }
    if (totalPoints >= 4) {
      newFilteredPoints = newFilteredPoints.filter(point => point >= 8000);
    }

    setFilteredPoints(newFilteredPoints);
  };

  const handleNext = async () => {
    const roundsRef = collection(db, 'games', gameId, 'rounds');
    await addDoc(roundsRef, {
      ...currentRound,
      isTsumo: isTsumo,
      isNaki: isNaki,
      isReach: isReach,
      discarder: discarder,
      discarderPoints: discarderPoints,
      roles: selectedRoles // 役を保存
    });

    const winnerRef = doc(db, 'members', currentRound.winner);
    const discarderRef = doc(db, 'members', discarder);

    await updateDoc(winnerRef, {
      totalPoints: (await getDoc(winnerRef)).data().totalPoints + parseInt(currentRound.winnerPoints, 10)
    });

    await updateDoc(discarderRef, {
      totalPoints: (await getDoc(discarderRef)).data().totalPoints - parseInt(discarderPoints, 10)
    });

    setCurrentRound({
      discarder: '',
      discarderPoints: '',
      isNaki: false,
      isReach: false,
      roundNumber: { round: '1', place: '東', honba: '0' },
      winner: '',
      winnerPoints: '',
      isTsumo: false,
      roles: []
    });
    setIsTsumo(false);
    setIsNaki(false);
    setIsReach(false);
    setDiscarder('');
    setDiscarderPoints('');
    setSelectedRoles([]);

    try {
      await setDoc(doc(firestore, "games", gameId, "rounds", "currentRound"), {
        ...currentRound,
        isTsumo: isTsumo,
        isNaki: isNaki,
        isReach: isReach,
        discarder: discarder,
        discarderPoints: discarderPoints,
        roles: selectedRoles // 役を保存
      });
      console.log("Round data saved successfully!");
    } catch (error) {
      console.error("Error saving round data: ", error);
    }

    navigation.push('ScoreInput', { gameId });
  };

  const handlePrevious = () => {
    if (currentRoundIndex > 0) {
      const newIndex = currentRoundIndex - 1;
      setCurrentRound(rounds[newIndex]);
      setCurrentRoundIndex(newIndex);
    }
  };

  const handleFinish = () => {
    navigation.navigate('Result', { gameId });
  };

  const confirmRolesSelection = () => {
    setCurrentRound({ ...currentRound, roles: selectedRoles });
    setModalVisible(false);
  };

  return (
    <ScrollView flex={1}>
      <Box flex={1} justifyContent="center" padding={4}>
        <Text>局ごとの成績を入力してください:</Text>
        <VStack space={4} >
        <HStack space={4} >
          <Box width="20%">
            <Select
              selectedValue={currentRound.roundNumber.place}
              onValueChange={(itemValue) => handleRoundNumberChange('place', itemValue)}
              placeholder="場所"
            >
              {['東', '南', '西', '北'].map((place) => (
                <Select.Item key={place} label={place} value={place} />
              ))}
            </Select>
            </Box>
          <Text> 場 </Text>
          <Box width="20%">
            <Select
              selectedValue={currentRound.roundNumber.round}
              onValueChange={(itemValue) => handleRoundNumberChange('round', itemValue)}
              placeholder="局"
            >
              {[1, 2, 3, 4].map((round) => (
                <Select.Item key={round} label={round.toString()} value={round.toString()} />
              ))}
            </Select>
          </Box>
          <Text> 局 </Text>
          <Box width="20%">
            <Select
              selectedValue={currentRound.roundNumber.honba}
              onValueChange={(itemValue) => handleRoundNumberChange('honba', itemValue)}
              placeholder="本場"
            >
              {Array.from({ length: 20 }, (_, i) => i + 1).map((honba) => (
                <Select.Item key={honba} label={honba.toString()} value={honba.toString()} />
              ))}
            </Select>
          </Box>
          <Text> 本場 </Text>
          </HStack>
          <Select
            selectedValue={currentRound.winner}
            onValueChange={(itemValue) => handleChange('winner', itemValue)}
            placeholder="あがった人"
          >
            {members.map((member) => (
              <Select.Item key={member.id} label={member.name} value={member.id} />
            ))}
          </Select>
          <HStack space={4} alignItems="center">
              <Text>ツモ:</Text>
              <Switch isChecked={isTsumo} onToggle={() => setIsTsumo(!isTsumo)} />
              <Text>鳴き:</Text>
              <Switch isChecked={isNaki} onToggle={() => setIsNaki(!isNaki)} />
              <Text>リーチ:</Text>
              <Switch isChecked={isReach} onToggle={() => setIsReach(!isReach)} />
          </HStack>
          <Select
            selectedValue={currentRound.winnerPoints}
            onValueChange={(itemValue) => handleChange('winnerPoints', itemValue)}
            placeholder="あがり点"
          >
            {filteredPoints.map((point, index) => (
              <Select.Item key={index} label={point.toString()} value={point.toString()} />
            ))}
          </Select>
          <Text>あがった役:</Text>
          <ScrollView horizontal={true} style={{ marginVertical: 10 }}>
            {selectedRoles.map((role, index) => (
              <Button
                key={index}
                variant="outline"
                margin={1}
              >
                {role}
              </Button>
            ))}
          </ScrollView>
          <Button onPress={() => setModalVisible(true)}>あがった役を選択</Button>
          <Modal isOpen={modalVisible} onClose={() => setModalVisible(false)}>
            <Modal.Content maxWidth="400px">
              <Modal.CloseButton />
              <Modal.Header>あがった役を選択</Modal.Header>
              <Modal.Body>
                <ScrollView>
                  {rolesOptions.map((roleObj, index) => (
                    <Button
                      key={index}
                      variant={selectedRoles.includes(roleObj.role) ? "solid" : "outline"}
                      margin={1}
                      onPress={() => toggleRoleSelection(roleObj.role)}
                    >
                      {roleObj.role}
                    </Button>
                  ))}
                </ScrollView>
              </Modal.Body>
              <Modal.Footer>
                <Button onPress={confirmRolesSelection}>OK</Button>
              </Modal.Footer>
            </Modal.Content>
          </Modal>
          {!isTsumo && (
            <VStack space={4}>
            <Select
              selectedValue={currentRound.winner}
              onValueChange={(itemValue) => handleChange('discarder', itemValue)}
              placeholder="放銃した人"
            >
              {members.map((member) => (
                <Select.Item key={member.id} label={member.name} value={member.id} />
              ))}
            </Select>

            </VStack>
          )}
          <HStack space={4} alignItems="center">
            <Button onPress={handlePrevious}>前へ</Button>
            <Button onPress={handleFinish}>終了</Button>
            <Button onPress={handleNext}>次へ</Button>
          </HStack>
        </VStack>
      </Box>
    </ScrollView>
  );
};

export default ScoreInputScreen;
