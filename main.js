const ImgChecker = function()
{
	const Request = require( 'request' );
	const CHEERIO = require( "cheerio" );
	const FS = require( 'fs' );
	const Read = FS.readFileSync;
	const Write = FS.writeFile;
	const RemoveFile = FS.unlinkSync;

	const GetHTML = function( thing )
	{
		return thing.wrap( '<p/>' ).parent().html().replace( '<', '&lt;' ).replace( '>', '&gt;' );
	};

	const ShowImgTags = function( $, imgs )
	{
		let text = '<h3>Images Tags</h3><ul>';
		imgs.each
		(
			function()
			{
					 text += `<li>${ GetHTML( $( this ) ) }</li>`;
			}
		);
		return text;
	};

	const ShowImgAlts = function( $, imgs )
	{
		imgs.each
		(
			function()
			{
				console.log( $( this ).attr( 'alt' ) );
			}
		);
	};

	const ShowImagesWithoutAltTags = function( $, imgs )
	{
		let text = '<h3>Images without Alt Tags</h3><ul>';
		imgs.each
		(
			function()
			{
				if ( undefined === $( this ).attr( 'alt' ) )
				{
					text += `<li>${ GetHTML( $( this ) ) }</li>`;
				}
			}
		);
		return text;
	};

	const HandleRequest = function( content, url )
	{
		if ( content === undefined ) { throw "AHHHH!"; }
		const $ = CHEERIO.load( content );
		const IMGS = $( 'img' );

		let text = `<div class="group"><h2>${ url }</h2>`;
		text += ShowImagesWithoutAltTags( $, IMGS );
		text += '</div>';
		return text;
	};

	const PrintFinalContent = function( content )
	{
		const FINAL_CONTENT = `
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
</head>
<body>
	<h1>Images Missing Alt Tags for ${ process.argv[ 2 ] }</h1>
	${ content }
</body>
</html>
		`;

		Write( './images-missing-alt-tags.html', FINAL_CONTENT );
		Write( './.interrupted', '' );
		RemoveFile( './.progress' );
		RemoveFile( './.links-left' );
	};

	const PrintProgress = function( content )
	{
		Write( './.progress', content );
		Write( './.interrupted', '!' );
	};

	const PrintLinks = function( link_data )
	{
		let links = '';
		for ( const N in link_data )
		{
			const I = link_data[ N ];
			links += `${ I }\n`;
		}

		Write( './.links-left', links );
	};

	const MakeRequest = function( urls, index, content )
	{
		const URL = urls[ index ];

		const OPTIONS =
		{
			uri: URL
		};

		return Request
		(
			OPTIONS,
			function( err, response, data )
			{
				if ( err )
				{
					PrintProgress( content );
					const REMAINING_URLS = urls.slice( index );
					PrintLinks( REMAINING_URLS );
					throw err;
				}
				else
				{
					content += HandleRequest( data, URL );

					if ( index === urls.length - 1 )
					{
						PrintFinalContent( content );
					}
					else if ( index < urls.length - 1 )
					{
						MakeRequest( urls, index + 1, content );
					}
					else
					{
						throw "Somehow URLs list has gone beyond end.";
					}
				}
			}
		);
	};

	const CheckInterrupted = function()
	{
		const INTERRUPTED = Read( './.interrupted' );
		return !( !INTERRUPTED && INTERRUPTED[ 0 ] !== '!' );
	};

	if ( CheckInterrupted() )
	{
		const LINKS = Read( './.links-left' ).split( "\n" );
		const CONTENT = Read( './.progress' );
		MakeRequest( LINKS, 0, CONTENT );
	}
	else
	{
		const LINKS = require( './get-links.js' );
		if ( LINKS.length > 0 )
		{
			MakeRequest( LINKS, 0, '' );
		}
	}
};
ImgChecker();