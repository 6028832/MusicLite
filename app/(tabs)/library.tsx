import React, { useState } from "react";
import { Text, View, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import Tracks from "@/components/library/Tracks";
import Albums from '@/components/library/Albums';
import Playlists from '@/components/library/Playlists';
import Artists from '@/components/library/Artists';

export default function Library() {
    const [filter, setFilter] = useState("Tracks");

    const renderContent = () => {
        switch (filter) {
            case "Tracks":
                return <Tracks  />;
            case "Albums":
                return <Albums />;
            case "Playlists":
                return <Playlists />;
            case "Artists":
                return <Artists />;
            default:
                return null;
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.buttonWrapper}>
                <ScrollView
                    contentContainerStyle={styles.buttonContainer}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                >
                    <TouchableOpacity style={styles.button} onPress={() => setFilter("Tracks")}>
                        <Text style={styles.buttonText}>Tracks</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={() => setFilter("Albums")}>
                        <Text style={styles.buttonText}>Albums</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={() => setFilter("Playlists")}>
                        <Text style={styles.buttonText}>Playlists</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={() => setFilter("Artists")}>
                        <Text style={styles.buttonText}>Artists</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>

            <View style={styles.contentContainer}>
                {renderContent()}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 16,
        paddingBottom: 16,
    },
    buttonWrapper: {
        height: 60,
        marginBottom: 10,
        marginStart: 10,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    button: {
        backgroundColor: "#282828",
        paddingVertical: 12,
        paddingHorizontal: 20,
        marginHorizontal: 5,
        borderRadius: 8,
    },
    buttonText: {
        color: "#FFFFFF",
        textAlign: "center",
        fontWeight: "bold",
    },
    contentContainer: {
        flex: 1,
    },
});