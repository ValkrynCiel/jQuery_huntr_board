$(function() {

  let $body = $('body');

  // container for creating and storing lists
  let $listOrderContainer = $('#list-order-container');
  let $newListButton = $('#new-list-button');

  // delete form and inputs
  let $deleteNotice = $('#delete-form');
  let $deleteListId = $('#delete-list-id');
  let $deleteJobId = $('#delete-job-id');
  let $deleteButton = $('#delete-button');
  let $nevermindButton = $('#nevermind-button');

  // add form and inputs
  let $addForm = $('#add-form');
  let $addCompany = $('#add-company');
  let $addPosition = $('#add-position');
  let $addListId = $('#add-list-id');
  let $addLink = $('#add-link');

  // edit info form and inputs
  let $editForm = $('#edit-form');
  let $editJobId = $('#edit-job-id')
  let $editCompany = $('#edit-company');
  let $editPosition = $('#edit-position');
  let $editColor = $('#edit-color');
  let $editNotes = $('#edit-notes');
  let $editLink = $('#edit-link');
  
  /*********** INITIALIZATION OF INTERFACE ****************/

  displayLists();
  setTimeout(updateTimeDisplay, 60000);

  /** recursive setTimeout call to update time displays each minute */
  function updateTimeDisplay () {
    $('.job-post').each(function () {
      $(this)
        .find('.time')
        .html(moment($(this).data().info.time).fromNow())
    });
    setTimeout(updateTimeDisplay, 60000);
  }

  /** loops through ids of listOrder and dynamically creates lists populated with jobs */
  function displayLists() {
    for (let key of listOrder) {
      let { title, order } = lists[key]
      let $list = createList(key, title);
      displayJobOrder($list, order);

    }
    // this container is hidden to avoid flashing on load
    $('.new-list-container').css('opacity', 1);
  }

  /** fills list template with information title and id info*/
  function createList(listId, title) {
  
    let $list = $($('#list-template').html());

      $list
        .find('.list-title')
          .val(title);

      $list.attr('id', listId);

      $listOrderContainer.append($list);

      return $list;
  }

  /** jobs are appended to the sortable container of their corresponding list */
  function displayJobOrder($list, order) {

    let $sortable = $list
      .children('.job-sortable')
      .eq(0);
    
    for (let jobId of order) {

      let jobInfo = jobs[jobId];
      let $jobPost = createJobPost(jobId, jobInfo);

      $sortable.append($jobPost);
    }; 
  }

  /** job info is filled in according to template */
  function createJobPost(id, info) {
    let $jobPost = $($('#job-post-template').html());
    let { color, company, position, link, time } = info

    $jobPost
      .attr('id', id)
      .css({ 'background-color': color })
      .data({ info })
      .find('.company-name')
        .html(company);

    $jobPost
      .find('.position-name')
        .html(position || 'position not listed');

    $jobPost
      .find('.time')
        .html(moment(time).fromNow());

    if (link) {

      let url = link.includes('http://') || link.includes('https://') ?
      link : `http://${link}`

      $jobPost.find('.icon-container').append(
        `<a href='${url}' target='_blank'>
          <div class="icon link">
            <i class="fas fa-external-link-square-alt"></i>
          </div>
        </a>`
      )
    }

    return $jobPost
  }

  /************ JQUERY UI SORTABLE CUSTOMIZATION ***********/
  function initializeSort () {
    // list sorting interactions and effects
    $listOrderContainer.sortable({
      tolerance: 'pointer',
      handle: '.fa-arrows-alt-h',
      helper: 'clone',
      revert: true,
      start: function (e, ui) {
        ui.helper.toggleClass('is-dragging');
        ui.item.toggleClass('is-dragging');
      },
      stop: function (e, ui) {
        ui.item.toggleClass('is-dragging');
        saveListOrder($listOrderContainer.sortable('toArray'));
      }
    });

    // job sorting interactions and effects
    $(".job-sortable").sortable({
      placeholder: 'job-placeholder',
      connectWith: ".job-sortable",
      opacity: 0.8,
      zIndex: 2,
      start: function (e, ui) {
        ui.item.eq(0).toggleClass('is-dragging');
      },
      over: function(e,ui) {
        // necessary to scroll up and down on the list dragged over
        if (ui.sender) {
          let widget = ui.sender.data("ui-sortable");
          widget.scrollParent = $(this);
          widget.overflowOffset = $(this).offset();
        }
      },
      receive: function (e , ui) {
        // partial update on the receiver of a job post when dragging
        // the rest is done in stop method
        let time = Date.now()
        let $jobPost = ui.item;

        $jobPost
          .find('.time')
          .html(moment(time).fromNow());

        $jobPost.data().info.time = time;

        let $list = $(this).closest('.list-container');
        let $sortable = $list.children('.job-sortable').eq(0);
        let order = $sortable.sortable('toArray');

        saveJobInfo($jobPost.attr('id'), { time });
        saveListInfo($list.attr('id'), { order });
      },
      stop: function (e, ui) {
        // updates state when finished dragging
        let $list = $(this).closest('.list-container');
        let $sortable = $list.children('.job-sortable').eq(0);
        let order = $sortable.sortable('toArray');

        saveListInfo($list.attr('id'), { order });
        ui.item.eq(0).toggleClass('is-dragging');
      }
    });
  } 
  
  initializeSort();
  
  /** adds a new list to state and to DOM */
  $newListButton.click(function () {

    let listId = Date.now();
    let listInfo = {title: '', order: []};

    $listOrderContainer.append(createList(listId, ''));
    $listOrderContainer.sortable('refresh');
    
    initializeSort();
    saveListInfo(listId, listInfo);
    saveListOrder($listOrderContainer.sortable('toArray'));

  });


  /************ GLOBAL EVENT LISTENERS AND HANDLERS *******/


  /** clicking a job post displays the job info form with inputs prepopulated */
  $body.on('click', '.job-post', function(e) {

    $editJobId
      .val($(this).attr('id'));

    let { company, position, color, link, notes } = $(this).data('info');

    $editCompany.val(company);
    $editPosition.val(position);
    $editColor.val(color);
    $editLink.val(link);
    $editNotes.val(notes);

    $editForm.modal({
      showClose: false
    });

  });

  /** necessary for link to external websites */
  $body.on('click', '.job-post a', function (e) {
    e.stopPropagation();
  })

  /** displays the delete job notice */
  $body.on('click', '.icon.trash', function(e) {
    e.stopPropagation();
    let listId = $(this)
      .closest('.list-container')
        .eq(0)
        .attr('id');

    let jobId = $(this)
      .closest('.job-post')
        .eq(0)
        .attr('id');

    // info for DOM removal
    $deleteJobId.val(jobId);
    // info for state removal
    $deleteListId.val(listId);

    $deleteNotice.modal({
      showClose: false
    });

  });

  /** opens the add job form with list specific info */
  $body.on('click', '.add-job-button', function(e) {
    let listId = $(this)
      .closest('.list-container')
      .eq(0).attr('id');

    $addListId.val(listId);

    $addForm.modal({
      showClose: false
    });
    
  });

  /** inverts color of icon in job post on mouse hover  */
  $body.on('mouseenter', '.icon', function (e) {
    let color = $(this).closest('.job-post').css('background-color');
    $(this).css({
      color
    })
  });

  /** reverts color inversion */
  $body.on('mouseleave', '.icon', function (e) {
    $(this).css({
      color: 'white'
    });
  });

  /** titles inputs can be changed and saved on blur */
  $body.on('blur', '.list-title', function (e) {
    let title = $(this).val();
    let listId = $(this)
      .closest('.list-container')
      .attr('id');

    saveListInfo(listId, { title })
  });

  /** Pushing return on keyboard will blur title input and save automatically */ 
  $body.on('keypress', '.list-title', function (e) {
    let keycode = (event.keyCode ? event.keyCode : event.which);
    if (keycode == '13') $(this).blur();
  });

  /********* FORM EVENT LISTENERS AND HANDLERS *************/

  /** gather all info from add job form to create job post to append to DOM
   *  save to state
   */
  $addForm.submit(function(e) {
    e.preventDefault();

    let listId = $addListId.val();
    let $sortable = $(`#${listId}`).children('.job-sortable').eq(0);

    let company = $addCompany.val();
    if (!company) return;
    
    let position = $addPosition.val();
    let link = $addLink.val();
    let time = Date.now();
    let color = `rgb(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)})`;
    
    // add job post to DOM (time is used as ID for now)
    let jobId = time;
    let jobInfo = { company, position, link, time, color, notes: '' };

    let $jobPost = createJobPost(jobId, jobInfo);
    $sortable.append($jobPost);
    
    // save job in state
    let order = $sortable.sortable('toArray')
    saveJobInfo(jobId, jobInfo);
    saveListInfo(listId, { order });

    // reset inputs
    $('.modal input').val('');

    $.modal.close();

  });

  /** save updated info to state and update DOM */
  $editForm.submit(function(e) {
    e.preventDefault();

    let color = $editColor.val();
    let company = $editCompany.val();
    let position = $editPosition.val();
    let link = $editLink.val()
    let jobId = $editJobId.val();
    let notes = $editNotes.val();

    if (!company) return;
    // edit state
    saveJobInfo(jobId, { color, company, position, link, notes });

    // replace in DOM
    let $newJobPost = createJobPost(jobId, jobs[jobId]);
    $(`#${jobId}`).replaceWith($newJobPost);

    $.modal.close();
  });

  /** delete button removes job from state and job post from DOM */
  $deleteButton.click(function (e) {
    e.preventDefault();
    let $job = $(`#${$deleteJobId.val()}`);
    let $list = $(`#${$deleteListId.val()}`);

    // DOM removal
    $job.remove();

    // state removal
    deleteJob($job.attr('id'), $list.attr('id'));

    $.modal.close();
  });

  /** do nothing if user changes their mind */
  $nevermindButton.click(function (e) {
    e.preventDefault();
    $.modal.close();
  });
  
});