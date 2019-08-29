$(function() {

  let $body = $('body');

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

  // edit/view info form and inputs
  let $editForm = $('#edit-form');
  let $editJobId = $('#edit-job-id')
  let $editCompany = $('#edit-company');
  let $editPosition = $('#edit-position');
  let $editColor = $('#edit-color');
  let $editNotes = $('#edit-notes');
  let $editLink = $('#edit-link');

  // container for creating and storing lists
  let $listOrderContainer = $('#list-order-container');
  let $newListButton = $('#new-list-button');
  
  /*********** Initialization of Interface ****************/

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
    saveToLocalStorage({ jobs, lists, listOrder });
  }

  /** fills list template with information title and id info*/
  function createList(listId, title) {
      debugger
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

  /************ jQuery UI Sortable Customization ***********/

  // list sorting interactions and effects
  $listOrderContainer.sortable({
    tolerance: 'pointer',
    handle: '.fa-arrows-alt-h',
    helper: 'clone',
    start: function (e, ui) {
      ui.helper.toggleClass('is-dragging');
      ui.item.toggleClass('is-dragging');
    },
    stop: function (e, ui) {
      ui.item.toggleClass('is-dragging');
      listOrder = $listOrderContainer.sortable('toArray');
      saveToLocalStorage({ listOrder }); 
    }
  });

  // customization of job sorting interactions and effects
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
      // (the rest is done in stop method)
      let time = Date.now()
      let $jobPost = ui.item;

      $jobPost
        .find('.time')
        .html(moment(time).fromNow());

      $jobPost.data().info.time = time;
      jobs[$jobPost.attr('id')].time = time;

      let $list = $(this).closest('.list-container');
      let $sortable = $list.children('.job-sortable').eq(0);

      lists[$list.attr('id')].order = $sortable.sortable('toArray');
      saveToLocalStorage({ jobs });
    },
    stop: function (e, ui) {
      // updates state when finished dragging
      let $list = $(this).closest('.list-container');
      let $sortable = $list.children('.job-sortable').eq(0);

      lists[$list.attr('id')].order = $sortable.sortable('toArray');
      
      ui.item.eq(0).toggleClass('is-dragging')
      saveToLocalStorage({ lists });
    }
  });

  /************ global event listeners and handlers *******/

  /** adds a new list to state and to DOM */
  $newListButton.click(function () {

    let listId = Date.now();
    
    listOrder.push(listId);
    lists[listId] = {title: '', order: []};

    $listOrderContainer.append(createList(listId, ''));

    saveToLocalStorage({ lists, listOrder });

  });

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

    // for DOM removal
    $deleteJobId.val(jobId);
    // for state removal
    $deleteListId.val(listId);

    $deleteNotice.modal({
      showClose: false
    });

  });

  /** opens the add job form initialized to that list */
  $body.on('click', '.add-job-button', function(e) {
    let listId = $(this)
      .closest('.list-container')
      .eq(0).attr('id');

    $addListId.val(listId);

    $addForm.modal({
      showClose: false
    });
    
  });

  /** inverts color of icon on mouse hover  */
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

    lists[listId].title = title;
    saveToLocalStorage({ lists }); 
  });

  // Pushing return on keyboard will blur title input and save automatically
  $body.on('keypress', '.list-title', function (e) {
    let keycode = (event.keyCode ? event.keyCode : event.which);
    if (keycode == '13') $(this).blur();
  });

  /********* form event listeners and handlers *************/

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
    
    let info = { company, position, link, time, color, notes: '' }
    
    // add job post to DOM (time is used as ID for now)
    let $jobPost = createJobPost(time, info);
    $sortable.append($jobPost);

    // save job in state
    jobs[jobId] = info
    lists[listId].order = $sortable.sortable('toArray');
    saveToLocalStorage({ jobs, lists });

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
    let id = $editJobId.val();
    let notes = $editNotes.val();

    if (!company) return;

    jobs[id] = { color, company, position, link, notes };

    let $newJobPost = createJobPost(id, jobs[id]);
    $(`#${id}`).replaceWith($newJobPost);

    saveToLocalStorage({ jobs });

    $.modal.close();
  });

  /** delete button removes job from state and job post from DOM */
  $deleteButton.click(function (e) {
    e.preventDefault();
    let $job = $(`#${$deleteJobId.val()}`);
    let $list = $(`#${$deleteListId.val()}`);
    let $sortable = $list.children('.job-sortable').eq(0);

    // DOM removal
    $job.remove();
    delete jobs[$job.attr('id')];

    // state removal
    lists[$list.attr('id')].order = $sortable.sortable('toArray');
    saveToLocalStorage({ lists, jobs });

    $.modal.close();
  });

  /** do nothing if user changes their mind */
  $nevermindButton.click(function (e) {
    e.preventDefault();
    $.modal.close();
  });
  
});