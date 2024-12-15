import React from 'react';
import {
    Modal,
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Image,
} from 'react-native';

export default function AlbumPopup({
    album,
    onClose,
}: {
    album: any;
    onClose: () => void;
}) {
    if (!album) return null;  // Return nothing if no album data is passed

    return (
        <Modal
            transparent={true}
            animationType="slide"
            visible={!!album}
            onRequestClose={onClose}
        >
            <View style={styles.fullScreenModal}>
                <TouchableOpacity style={styles.backButton} onPress={onClose}>
                    <Text style={styles.backButtonText}>{'<-'}</Text>
                </TouchableOpacity>

                <Text style={styles.modalTitle}>{album.title}</Text>
                <ScrollView style={styles.songList}>
                    {album.songs?.map((song: any) => (
                        <SongEntry song={song} key={song.id} />
                    ))}
                </ScrollView>
            </View>
        </Modal>
    );
}

function SongEntry({ song }: { song: any }) {
    const minutes = Math.floor(song.duration / 60);
    const seconds = song.duration % 60;

    return (
        <View style={styles.songContainer}>
            {song.thumbnail ? (
                <Image source={{ uri: song.thumbnail }} style={styles.thumbnail} />
            ) : (
                <View style={styles.thumbnail} />
            )}
            <View>
                <Text style={styles.songText}>{song.filename}</Text>
                <Text style={styles.songDuration}>
                    {minutes}:{seconds < 10 ? '0' + seconds : seconds}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    fullScreenModal: {
        flex: 1,
        backgroundColor: '#000',
        paddingTop: 50,
        paddingHorizontal: 20,
    },
    backButton: {
        position: 'absolute',
        top: 10,
        left: 10,
        zIndex: 1,
        padding: 10,
        borderRadius: 8,
    },
    backButtonText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    modalTitle: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    songList: {
        marginTop: 20,
    },
    songContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    thumbnail: {
        width: 50,
        height: 50,
        borderRadius: 8,
        marginRight: 10,
        backgroundColor: '#ccc', // placeholder for missing image
    },
    songText: {
        color: '#fff',
        fontSize: 16,
    },
    songDuration: {
        color: '#bbb',
        fontSize: 14,
    },
});
