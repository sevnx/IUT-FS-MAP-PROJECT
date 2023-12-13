export function getMetroColor(line: string): string {
    switch (line) {
        case "1":
            return "#ffcd00";
        case "2":
            return "#003df5";
        case "3":
            return "#827a04";
        case "3bis":
            return "#71c5e8";
        case "4":
            return "#c800a1";
        case "5":
            return "#ff7f32";
        case "6":
            return "#71cc98";
        case "7":
            return "#f59bbb";
        case "7bis":
            return "#71cc98";
        case "8":
            return "#dd9cdf";
        case "9":
            return "#b5bd00";
        case "10":
            return "#c69214";
        case "11":
            return "#6e4c1e";
        case "12":
            return "#007a53";
        case "13":
            return "#71c5e8";
        case "14":
            return "#5f259f";
        case "15":
            return "#a50034";
        case "16":
            return "#f59bbb";
        case "17":
            return "#b5bd00";
        case "18":
            return "#00ab8e";
        default:
            return "#000";
    }
}