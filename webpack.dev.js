const path = require( 'path' );
const MergeIntoSingleFilePlugin = require( 'webpack-merge-and-include-globally' );
const { merge } = require( 'webpack-merge' );
const common = require( './webpack.common' );

module.exports = merge( common, {
    mode: 'development',
    plugins: [
        new MergeIntoSingleFilePlugin( {
            files: {
                'Tests.js': [
                    path.resolve( __dirname, 'test/GAS_Test_Functions.js' ),
                ],
            },
        } ),
    ],
} );
