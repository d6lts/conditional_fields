
if (!Drupal.ConditionalFields) {
  Drupal.ConditionalFields = {};
}

Drupal.ConditionalFields.switchField = function(id, values, onPageReady) {
  var settings = Drupal.settings.ConditionalFields[Drupal.ConditionalFields.currentForm.find('input[name="form_build_id"]').val()],
      cF = Drupal.ConditionalFields;

  // Check each controlled field
  if (settings.controlling_fields == undefined || settings.controlling_fields[id] == undefined) {
    return;
  }
  $.each(settings.controlling_fields[id], function(i, controlledField) {
    var triggers = cF.checkTriggered(controlledField, values);
    // If the field was not triggered, hide it
    if (!triggers) {
      cF.doAnimation(settings.ui_settings, controlledField, 'hide', onPageReady);
    }
    // Else check other controlling fields: if any one doesn't trigger, hide the field and stop checking
    else {
      var otherTriggers = true;
      $.each(settings.controlling_fields, function(ii, maybeControllingField) {
        if (ii != id) {
          $.each(maybeControllingField, function(iii, maybeControlledField) {
            if (maybeControlledField.field_id == controlledField.field_id) {
              otherTriggers = cF.checkTriggered(maybeControlledField, cF.findValues($(ii)));
              if (!otherTriggers) {
                return false;
              }
            }
          });
        }
        if (!otherTriggers) {
          cF.doAnimation(settings.ui_settings, controlledField, 'hide', onPageReady);
          return false;
        }
      });
      if (otherTriggers) {
        cF.doAnimation(settings.ui_settings, controlledField, 'show', onPageReady);
      }
    }
  });
}

Drupal.ConditionalFields.checkTriggered = function(controlledField, selectedValues) {
  var triggers = false;
  $.each(controlledField.trigger_values, function(i, val) {
    if ($.inArray(val, selectedValues) !== -1) {
      triggers = true;
      return false;
    }
  });
  return triggers;
}

Drupal.ConditionalFields.doAnimation = function(uiSettings, fieldSettings, showOrHide, onPageReady) {
  /* Multiple fields are enclosed in a wrapper */
  if ($(fieldSettings.field_id).parents('#' + fieldSettings.field_id.substring(13) + '-add-more-wrapper').length == 1) {
    var toSwitch = $('#' + fieldSettings.field_id.substring(13) + '-add-more-wrapper', Drupal.ConditionalFields.currentForm);
  } else {
    var toSwitch = $(fieldSettings.field_id, Drupal.ConditionalFields.currentForm);
  }

  if (uiSettings == 'disable') {
    var disabled = '';
    if (showOrHide == 'hide') {
      disabled = 'disabled';
    }
    toSwitch.find('textarea, input, select').attr('disabled', disabled);
  }
  /* Avoid flickering */
  else if (onPageReady == true) {
    /* Setting css instead of simply hiding to avoid interference from collapse.js */
    showOrHide == 'show' ? toSwitch.show() : toSwitch.css('display', 'none');
  }
  else {
    switch (uiSettings.animation) {
      case 0:
        toSwitch[showOrHide == 'show' ? 'show' : 'hide']();
        break;
      case 1:
        toSwitch['fade' + (showOrHide == 'show' ? 'In' : 'Out')](uiSettings.anim_speed);
      case 2:
        /* Don't double top and bottom margins while sliding. */
        var firstChild = toSwitch.children(':first-child'),
            marginTop = firstChild.css('margin-top'),
            marginBottom = firstChild.css('margin-bottom');
        firstChild.css({ 'margin-top' : 0, 'margin-bottom' : 0 });
        toSwitch['slide' + (showOrHide == 'show' ? 'Down' : 'Up')](uiSettings.anim_speed, function() {
          firstChild.css({'margin-top': marginTop, 'margin-bottom': marginBottom});
        });
        break;
    }
  }
}

Drupal.ConditionalFields.findValues = function(field) {
  var values = [];
  field.find('option:selected, input:checked, input:text, textarea').each( function() {
    values.push(this.value);
  });
  return values;
}

Drupal.ConditionalFields.fieldChange = function() {
  Drupal.ConditionalFields.currentForm = $(this).parents('form').eq(0);

  var wrapper = $(this).parents('.controlling-field').eq(0),
      values = Drupal.ConditionalFields.findValues(wrapper),
      id = '#' + wrapper.attr('id');

  Drupal.ConditionalFields.switchField(id, values, false);
}

Drupal.behaviors.ConditionalFields = function (context) {
  $('.conditional-field.controlling-field:not(.conditional-field-processed)').addClass('conditional-field-processed').each(function () {
    /* Set default state */
    Drupal.ConditionalFields.currentForm = $(this).parents('form').eq(0);
    Drupal.ConditionalFields.switchField('#' + $(this).attr('id'), Drupal.ConditionalFields.findValues($(this)), true);
    $(this).find('select, input:radio, input:checkbox').each(function() {
      /* Apparently, Explorer doesn't catch the change event? */
      $.browser.msie == true ? $(this).click(Drupal.ConditionalFields.fieldChange) : $(this).change(Drupal.ConditionalFields.fieldChange);
    })
    .end().find('textarea, input:text').each(function() {
      $(this).keyup(Drupal.ConditionalFields.fieldChange);
    });
  });
};
