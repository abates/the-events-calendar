var tribe_list_paged = 1;


function tribe_setup_isotope( $container ) {
	
	if( jQuery().isotope ) {
		
		var tribe_not_initial_resize = false;
		var tribe_last_width, container_width = 0;
		
		$container.imagesLoaded( function(){    
			$container.isotope({
				containerStyle: {
					position: 'relative', 
					overflow: 'visible'
				},
				resizable: false 
			});
		});

		$container.resize(function() {		
			container_width = $container.width();			
			if ( container_width < 643 ) {
				$container.addClass('photo-two-col');
			} else {
				$container.removeClass('photo-two-col');
			}
			
			if( tribe_not_initial_resize && container_width !== tribe_last_width )
				$container.isotope('reLayout');
			
			tribe_not_initial_resize = true;
			tribe_last_width = container_width;
		});
	
	}
}

jQuery( document ).ready( function ( $ ) {	
	
	var container = $('#tribe-events-photo-events');	
	
	if ( container.width() < 643 ) {
		container.addClass('photo-two-col');
	} 
	
	var tribe_is_paged = tribe_get_url_param('tribe_paged');		
	
	if( tribe_is_paged ) {
		tribe_list_paged = tribe_is_paged;
	} 

	if( typeof GeoLoc === 'undefined' ) 
		var GeoLoc = {"map_view":""};	

	if( tribe_has_pushstate && !GeoLoc.map_view ) {
		
		var initial_url = location.href;
		
		if( tribe_storage )
			tribe_storage.setItem( 'tribe_initial_load', 'true' );	

		$(window).bind('popstate', function(event) {
			
			var initial_load = '';
			
			if( tribe_storage )
				initial_load = tribe_storage.getItem( 'tribe_initial_load' );	
			
			var state = event.originalEvent.state;

			if( state ) {				
				tribe_do_string = false;
				tribe_pushstate = false;	
				tribe_popping = true;
				tribe_params = state.tribe_params;
				tribe_url_params = state.tribe_url_params;
				tribe_pre_ajax_tests( function() {
					tribe_events_list_ajax_post( '', tribe_pushstate, tribe_do_string, tribe_popping, tribe_params, tribe_url_params );	
				});
			} else if( tribe_storage && initial_load !== 'true' ){				
				window.location = initial_url;
			}
		} );
		
	}	

		// events bar intercept submit

		$( 'body' ).on( 'click', 'a#tribe_paged_next', function ( e ) {
			e.preventDefault();
			tribe_list_paged++;	
			tribe_pre_ajax_tests( function() { 
				tribe_events_list_ajax_post( tribe_cur_url );
			});
		} ).on( 'click', 'a#tribe_paged_prev', function ( e ) {
			e.preventDefault();
			tribe_list_paged--;
			tribe_pre_ajax_tests( function() {
				tribe_events_list_ajax_post( tribe_cur_url );
			});
		} );

		// if advanced filters active intercept submit

		if ( $( '#tribe_events_filters_form' ).length ) {
			$( 'form#tribe_events_filters_form' ).bind( 'submit', function ( e ) {
				if ( tribe_events_bar_action != 'change_view' ) {
					e.preventDefault();	
					tribe_list_paged = 1;
					tribe_pre_ajax_tests( function() {
						tribe_events_list_ajax_post( tribe_cur_url );
					});
				}
			} );
		}
		
		// event bar datepicker monitoring 
		
		function tribe_events_bar_photoajax_actions(e) {
			if ( tribe_events_bar_action != 'change_view' ) {
				e.preventDefault();
				tribe_list_paged = 1;
				tribe_pre_ajax_tests( function() {
					tribe_events_list_ajax_post( tribe_cur_url );
				});
			}
		}

		$('#tribe-bar-date').bind( 'change', function (e) {		
			tribe_events_bar_photoajax_actions(e)
		} );
		
		$( '.tribe-bar-settings button[name="settingsUpdate"]' ).bind( 'click', function (e) {		
			tribe_events_bar_photoajax_actions(e);
			$( '#tribe-events-bar [class^="tribe-bar-button-"]' )
				.removeClass( 'open' )
				.next( '.tribe-bar-drop-content' )
				.hide();
		} );
		
		$( 'form#tribe-bar-form' ).bind( 'submit', function ( e ) {
			if ( tribe_events_bar_action != 'change_view' ) {
				tribe_events_bar_photoajax_actions(e)
			}
		} );


		function tribe_events_list_ajax_post( tribe_href_target, tribe_pushstate, tribe_do_string, tribe_popping, tribe_params, tribe_url_params ) {

			$('#tribe-photo-loading').show();			
			
			if( !tribe_popping ) {			
				
				tribe_hash_string = $( '#tribe-events-list-hash' ).val();

				tribe_params = {
					action     :'tribe_photo',
					tribe_paged:tribe_list_paged					
				};
				
				tribe_url_params = {
					action     :'tribe_photo',
					tribe_paged:tribe_list_paged					
				};							
				
				if( tribe_hash_string.length ) {
					tribe_params['hash'] = tribe_hash_string;
				}				
				
				// add any set values from event bar to params. want to use serialize but due to ie bug we are stuck with second

				$( 'form#tribe-bar-form :input[value!=""]' ).each( function () {
					var $this = $( this );
					if( $this.val().length && !$this.hasClass('tribe-no-param') ) {
						if( $this.is(':checkbox') ) {
							if( $this.is(':checked') ) {
								tribe_params[$this.attr('name')] = $this.val();
								tribe_url_params[$this.attr('name')] = $this.val();	
							}
						} else {
							tribe_params[$this.attr('name')] = $this.val();
							tribe_url_params[$this.attr('name')] = $this.val();	
						}					
					}								
				} );
				
				tribe_params = $.param(tribe_params);
				tribe_url_params = $.param(tribe_url_params);

				// check if advanced filters plugin is active

				if( $('#tribe_events_filters_form').length ) {

					// serialize any set values and add to params

					tribe_filter_params = $('form#tribe_events_filters_form :input[value!=""]').serialize();
					if( tribe_filter_params.length ) {
						tribe_params = tribe_params + '&' + tribe_filter_params;
						tribe_url_params = tribe_url_params + '&' + tribe_filter_params;
					}					
				} 			
				
				tribe_pushstate = false;
				tribe_do_string = true;				
							
			}
			
			if( tribe_has_pushstate ) {

				$.post(
					TribePhoto.ajaxurl,
					tribe_params,
					function ( response ) {
						$( "#ajax-loading" ).hide();
						if( tribe_storage )
							tribe_storage.setItem( 'tribe_initial_load', 'false' );
						if ( response.success ) {

							tribe_list_paged = response.tribe_paged;

							$( '#tribe-events-list-hash' ).val( response.hash );						

							$( '#tribe-events-content' ).replaceWith( response.html );
							$( '#tribe-events-content' ).prev('#tribe-events-list-hash').remove();																		

							if ( response.max_pages > tribe_list_paged ) {
								$( 'a#tribe_paged_next' ).show();
							} else {
								$( 'a#tribe_paged_next' ).hide();
							}
							if ( tribe_list_paged > 1 ) {
								$( 'a#tribe_paged_prev' ).show();
							} else {
								$( 'a#tribe_paged_prev' ).hide();
							}
							
							if( tribe_do_string ) {
								tribe_href_target = tribe_href_target + '?' + tribe_url_params;								
								history.pushState({									
									"tribe_params": tribe_params,
									"tribe_url_params": tribe_url_params
								}, '', tribe_href_target);															
							}						

							if( tribe_pushstate ) {																
								history.pushState({									
									"tribe_params": tribe_params,
									"tribe_url_params": tribe_url_params
								}, '', tribe_href_target);
							}

							tribe_setup_isotope( $('#tribe-events-photo-events') );	
						}
					}
				);
			} else {
			
				if( tribe_do_string ) {
					tribe_href_target = tribe_href_target + '?' + tribe_url_params;													
				}
				window.location = tribe_href_target;			
			}
		} 
});

(function($) {
	$(window).load(function(){
		tribe_setup_isotope( $('#tribe-events-photo-events') );
	});
})(jQuery);