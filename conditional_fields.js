/* $Id$ */

if (!Drupal.ConditionalFields) {
  Drupal.ConditionalFields = {};
}

Drupal.ConditionalFields.switchField = function(id, values, onPageReady) {
  /* For each controlling field: find the controlled fields */
  $.each(Drupal.settings.ConditionalFields.controlling_fields, function(controllingField, controlledFields) {
    if (controllingField == id) {
      /* Find the settings of the controlled field */
      $.each(controlledFields, function(i, fieldSettings) {
        /* Multiple fields are enclosed in fieldsets */
        var parentTag = $(fieldSettings.field_id).parent().get(0).tagName;
        var parentId = $(fieldSettings.field_id).parent().attr('class');
        if (parentTag == 'FIELDSET' && parentId.indexOf("group-") != 0) {
          var toSwitch = $(fieldSettings.field_id).parent();
        } else {
          var toSwitch = $(fieldSettings.field_id);
        }
        if (Drupal.settings.ConditionalFields.ui_settings == "disable") {
          toSwitch.find("textarea, input, select").attr("disabled", "disabled");
        }
        /* Avoid flickering */
        else if (onPageReady == true) {
          toSwitch.hide();          
        }
        else {
          switch (Drupal.settings.ConditionalFields.ui_settings.animation) {
            case "0":
              toSwitch.hide();
            case "1":
              toSwitch.slideUp(Drupal.settings.ConditionalFields.ui_settings.anim_speed);
            case "2":
              toSwitch.fadeOut(Drupal.settings.ConditionalFields.ui_settings.anim_speed);
          }
        }
        
        /* Find the trigger values of the controlled field (for this controlling field) */
        $.each(fieldSettings.trigger_values, function(ii, val) {
          if (jQuery.inArray(val, values) != -1) {
            if (parentTag == 'FIELDSET' && parentId.indexOf("group-") != 0) {
              var toSwitch = $(fieldSettings.field_id).parent();
            } else {
              var toSwitch = $(fieldSettings.field_id);
            }
            if (Drupal.settings.ConditionalFields.ui_settings == "disable") {
              toSwitch.find("textarea, input, select").attr("disabled", "");
            }
            else if (onPageReady == true) {
              toSwitch.show();
            }
            else {
              switch (Drupal.settings.ConditionalFields.ui_settings.animation) {
                case "0":
                  toSwitch.show();
                case "1":
                  toSwitch.slideDown(Drupal.settings.ConditionalFields.ui_settings.anim_speed);
                case "2":
                  toSwitch.fadeIn(Drupal.settings.ConditionalFields.ui_settings.anim_speed);
              }
            }
            
            /* Stop searching in this field */
            return false;
          }
        });
        /* To do: Feature: Multiple controlling fields on the same field, are
           not supported for now. Test: other controlling fields types and widgets. */
      });
    }
  });
}

Drupal.ConditionalFields.findValues = function(field) {
  var values = [];
  field.find("option:selected, input:checked").each( function() {
    if ($(this)[0].selected || $(this)[0].checked) {
      values[values.length] = this.value;
    }
  });
  return values;
}       

Drupal.ConditionalFields.fieldChange = function() {
  var values = Drupal.ConditionalFields.findValues($(this));
  var id = '#' + $(this).attr('id');
  Drupal.ConditionalFields.switchField(id, values, false);
}

Drupal.behaviors.ConditionalFields = function (context) {
  $('.controlling-field:not(.ConditionalFields-processed)', context).addClass('ConditionalFields-processed').each(function () {
    /* Set default state */
    Drupal.ConditionalFields.switchField('#' + $(this).attr('id'), Drupal.ConditionalFields.findValues($(this)));
    /* Add events. Apparently, Explorer doesn't catch the change event? */
    $.browser.msie == true ? $(this).click(Drupal.ConditionalFields.fieldChange) : $(this).change(Drupal.ConditionalFields.fieldChange);
  });
};
