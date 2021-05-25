const path = require( 'path' );
const MergeIntoSingleFilePlugin = require( 'webpack-merge-and-include-globally' );

module.exports = {
    mode: '',
    entry: ['./src/controller/SpoddyCoiner.js'],
    output: {
        filename: '[name]',
        path: path.resolve( __dirname, 'dist' ),
        clean: true,
    },
    optimization: {
        minimize: false,
    },
    plugins: [
        new MergeIntoSingleFilePlugin( {
            files: {
                'Code.js': [
                    path.resolve( __dirname, 'src/controller/SpoddyCoiner.js' ),
                    path.resolve( __dirname, 'src/controller/CMC.js' ),
                    path.resolve( __dirname, 'src/model/GASProps.js' ),
                    path.resolve( __dirname, 'src/model/APICache.js' ),
                    path.resolve( __dirname, 'src/model/CMCApi.js' ),
                    path.resolve( __dirname, 'src/view/Menu.js' ),
                    path.resolve( __dirname, 'src/view/Sheet.js' ),
                    path.resolve( __dirname, 'src/Addon_Init.js' ),
                    path.resolve( __dirname, 'src/Custom_Functions.js' ),
                ],
            },
        } ),
    ],
};
