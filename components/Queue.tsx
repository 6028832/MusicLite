import React, {useState} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';

interface Track {
    id: string;
    filename: string;
}

interface QueueProps {
    queue: Track[];
    removeFromQueue: (id: string) => void;
}

export default function Queue({queue, removeFromQueue}: QueueProps) {
    return (
        <View>
            {queue.map((track, index) => (
                <View key={track.id}>
                    <Text>{track.filename}</Text>
                    <TouchableOpacity onPress={() => removeFromQueue(track.id)}>
                        <Text>Remove</Text>
                    </TouchableOpacity>
                </View>
            ))}
        </View>
    );
}
