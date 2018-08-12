import * as React from 'react'
import { render } from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import App from './components/App'

import {createMuiTheme, MuiThemeProvider} from '@material-ui/core/styles';

const theme = createMuiTheme({
    palette: {
        primary: {
            light: '#000000',
            main: '#000000',
            dark: '#000000',
        },
    } as any,
});

render(
    <MuiThemeProvider theme={theme}>
        <BrowserRouter>
            <App/>
        </BrowserRouter>
    </MuiThemeProvider>,
    document.getElementById("react-container")
);
