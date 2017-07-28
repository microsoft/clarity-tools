import {
    pinkA200,
    grey100, grey200, grey300, grey500, grey600,
    orange200, orange600, orange700,
    white, darkBlack, fullBlack,
} from 'material-ui/styles/colors';
import { fade } from 'material-ui/utils/colorManipulator';
import spacing from 'material-ui/styles/spacing';

export default {
    spacing: spacing,
    fontFamily: 'Roboto, sans-serif',
    palette: {
        primary1Color: orange700,
        primary2Color: orange600,
        primary3Color: grey600,
        accent1Color: darkBlack,
        accent2Color: grey100,
        accent3Color: grey500,
        textColor: darkBlack,
        alternateTextColor: darkBlack,
        canvasColor: white,
        borderColor: grey300,
        disabledColor: fade(darkBlack, 0.3),
        pickerHeaderColor: orange600,
        clockCircleColor: fade(darkBlack, 0.07),
        shadowColor: fullBlack,
    },
};