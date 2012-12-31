<?php
/**
* Venue metabox
*/

// Don't load directly
if ( !defined('ABSPATH') ) { die('-1'); }

?>
<?php if ($post->post_type != TribeEvents::VENUE_POST_TYPE): ?>
   <tr class="venue">
      <td><?php _e('Venue Name:','tribe-events-calendar'); ?></td>
      <td>
         <input tabindex="<?php $this->tabIndex(); ?>" type='text' name='venue[Venue]' size='25'  value='<?php if( isset($_VenueVenue) ) echo esc_attr($_VenueVenue); ?>' />
      </td>
   </tr>
<?php endif; ?>
<tr class="venue">
	<td><?php _e('Address:','tribe-events-calendar'); ?></td>
	<td><input tabindex="<?php $this->tabIndex(); ?>" type='text' name='venue[Address]' size='25' value='<?php if( isset($_VenueAddress) ) echo esc_attr($_VenueAddress); ?>' /></td>
</tr>
<tr class="venue">
	<td><?php _e('City:','tribe-events-calendar'); ?></td>
	<td><input tabindex="<?php $this->tabIndex(); ?>" type='text' name='venue[City]' size='25' value='<?php if( isset($_VenueCity) )  echo esc_attr($_VenueCity); ?>' /></td>
</tr>
<tr class="venue">
	<td><?php _e('Country:','tribe-events-calendar'); ?></td>
	<td>
		<?php
			$countries = TribeEventsViewHelpers::constructCountries( $postId );
			$defaultCountry = tribe_get_option('defaultCountry');
			if (isset($_VenueCountry) && $_VenueCountry) {
				$current = $_VenueCountry;
			} elseif (isset($defaultCountry[1]) && class_exists( 'TribeEventsPro' ) && tribe_get_option('defaultValueReplace')) {
				$current = $defaultCountry[1];
			} else {
				$current = null;
			}
		?>
		<select class="chosen" tabindex="<?php $this->tabIndex(); ?>" name='venue[Country]' id="EventCountry">
			<?php
			foreach ($countries as $abbr => $fullname) {
				if ( $abbr == '' ) {
					echo '<option value="">' . esc_html( $fullname ) . '</option>';
				} else {
					echo '<option value="' . esc_attr($fullname) . '" ';
	
					selected(($current == $fullname));
	
					echo '>' . esc_html($fullname) . '</option>';
				}
			}
			?>
		</select>
	</td>
</tr>
<tr class="venue">
	<?php if(!isset($_VenueStateProvince) || $_VenueStateProvince == "") $_VenueStateProvince = -1; ?>
	<td><?php _e('State or Province:','tribe-events-calendar'); ?></td>
	<td><input tabindex="<?php $this->tabIndex(); ?>" id="StateProvinceText" name="venue[Province]" type='text' name='' size='25' value='<?php echo ( isset($_VenueStateProvince) && $_VenueStateProvince != '' && $_VenueStateProvince != -1 ) ? esc_attr($_VenueProvince) : esc_attr(''); ?>' />
	<select class="chosen" tabindex="<?php $this->tabIndex(); ?>" id="StateProvinceSelect" name="venue[State]">
		<option value=""><?php _e('Select a State:','tribe-events-calendar'); ?></option>
		<?php
			foreach (TribeEventsViewHelpers::loadStates() as $abbr => $fullname) {
				echo '<option value="'.$abbr.'"';
				if( $_VenueStateProvince != -1 ){
					selected((( $_VenueStateProvince != -1 ? $_VenueStateProvince : $_VenueState) == $abbr));
				}
				echo '>' . esc_html($fullname) . '</option>';
			}
		?>
	</select>

	</td>
</tr>
<tr class="venue">
	<td><?php _e('Postal Code:','tribe-events-calendar'); ?></td>
	<td><input tabindex="<?php $this->tabIndex(); ?>" type='text' id='EventZip' name='venue[Zip]' size='6' value='<?php if( isset($_VenueZip) ) echo esc_attr($_VenueZip); ?>' /></td>
</tr>
<tr class="venue">
	<td><?php _e('Phone:','tribe-events-calendar'); ?></td>
	<td><input tabindex="<?php $this->tabIndex(); ?>" type='text' id='EventPhone' name='venue[Phone]' size='14' value='<?php if( isset($_VenuePhone) ) echo esc_attr($_VenuePhone); ?>' /></td>
</tr>
<tr class="venue">
	<td><?php _e('Website:','tribe-events-calendar'); ?></td>
	<td><input tabindex="<?php $this->tabIndex(); ?>" type='text' id='EventWebsite' name='venue[URL]' size='14' value='<?php if( isset($_VenueURL) ) echo esc_attr($_VenueURL); ?>' /></td>
</tr>

<tr id="google_map_link_toggle">
	<td><?php _e('Show Google Maps Link:','tribe-events-calendar'); ?></td>
	<td>
		<?php if ($post->post_type != TribeEvents::VENUE_POST_TYPE) { ?>			
			<input tabindex="<?php $this->tabIndex(); ?>" type="checkbox" id="EventShowMapLink" name="Venue[EventShowMapLink]" value="1" <?php checked((get_post_status($postId) == 'auto-draft') ? false : get_post_meta( $postId, '_EventShowMapLink', true )); ?> />
		<?php } else { ?>
			<input tabindex="<?php $this->tabIndex(); ?>" type="checkbox" id="EventShowMapLink" name="Venue[EventShowMapLink]" value="1" <?php checked((get_post_status($postId) == 'auto-draft') ? false : get_post_meta( $postId, '_VenueShowMapLink', true )); ?> />
		<?php } ?>
	</td>
</tr>

<?php if( tribe_get_option('embedGoogleMaps') ) : ?>
<tr id="google_map_toggle">
	<td><?php _e('Show Google Map:','tribe-events-calendar'); ?></td>
	<td>
		<?php if ($post->post_type != TribeEvents::VENUE_POST_TYPE) { ?>			
			<input tabindex="<?php $this->tabIndex(); ?>" type="checkbox" id="EventShowMap" name="Venue[EventShowMap]" value="1" <?php checked(tribe_embed_google_map($postId)); ?> />
		<?php } else { ?>
			<input tabindex="<?php $this->tabIndex(); ?>" type="checkbox" id="EventShowMap" name="Venue[EventShowMap]" value="1" <?php checked(tribe_embed_google_map($postId)); ?> />
		<?php } ?>
	</td>
</tr>
<?php endif; ?>

<script type="text/javascript">
	jQuery('[name=venue\\[Venue\\]]').blur(function(){
		jQuery.post('<?php echo admin_url('admin-ajax.php'); ?>',
			{
				action: 'tribe_event_validation',
				nonce: '<?php echo wp_create_nonce('tribe-validation-nonce'); ?>',
				type: 'venue',
				name: jQuery('[name=venue\\[Venue\\]]').get(0).value
			},
			function(result) {
				if (result == 1) {
					jQuery('[name=venue\\[Venue\\]]').parent().removeClass('invalid').addClass('valid');
				} else {
					jQuery('[name=venue\\[Venue\\]]').parent().removeClass('valid').addClass('invalid');
				}
			}
		);
	});
</script>
