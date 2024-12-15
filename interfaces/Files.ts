export default interface Files {
    albumId: string | number,
    creationTime: number,
    duration: number,
    filename: string,
    height: number,
    id: string,
    mediaType: 'audio',
    modificationTime: number,
    uri: string,
    width: number,
    imageUrl?: string,
    artist: string,
}