export interface Link { // given a link "ThisIsTheReal#Header1|This is the Given"
    titleName?: string; // This is the Given
    fragment?: string; // Header 1
    realName: string; // ThisIsTheReal
}