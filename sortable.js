$(function() {

  let $body = $('body');

  let $deleteNotice = $('#delete-form');
  let $deleteListId = $('#delete-list-id');
  let $deleteJobId = $('#delete-job-id');
  let $deleteButton = $('#delete-button');
  let $nevermindButton = $('#nevermind-button');

  let $addForm = $('#add-form');
  let $addCompany = $('#add-company');
  let $addPosition = $('#add-position');
  let $addListId = $('#add-list-id');
  let $addLink = $('#add-link');

  let $editForm = $('#edit-form');
  let $editJobId = $('#edit-job-id')
  let $editCompany = $('#edit-company');
  let $editPosition = $('#edit-position');
  let $editColor = $('#edit-color');
  let $editNotes = $('#edit-notes');
  let $editLink = $('#edit-link');

  let $listOrderContainer = $('#list-order-container');
  let $newListButton = $('#new-list-button');

  let savedJobs = localStorage.getItem('jobs')
  let jobs = savedJobs ? JSON.parse(savedJobs) : {}

  let savedLists = localStorage.getItem('lists');
  let lists = savedLists ? JSON.parse(savedLists) : 
  {
    1: {title: 'applied', order:[]},
    2: {title: 'phone screen', order:[]},
    3: {title: 'onsite', order:[]},
    4: {title: 'offer', order:[]},
    5: {title: 'rejected', order:[]}
  }

  let savedListOrder = localStorage.getItem('listOrder')

  let listOrder = savedListOrder ? JSON.parse(savedListOrder) :
  [1, 2, 3, 4, 5]
  

  function updateTimeDisplay () {
 
    $('.job-post').each(function () {
      $(this)
        .find('.time')
        .html(moment($(this).data().info.time).fromNow())
    });

    setTimeout(updateTimeDisplay, 60000);
  }

  setTimeout(updateTimeDisplay, 60000);

  function displayLists() {
    for (let key of listOrder) {
      
      let { title, order } = lists[key]
      let $list = createList(key, title);
      displayJobOrder($list, order);

    }

    $('.new-list-container').css('opacity', 1)
  }

  displayLists();

  function createList(listId, title) {
    
    let $list = $($('#list-template').html());

      $list
        .find('.list-title')
          .val(title);

      $list.attr('id', listId);

      $listOrderContainer.append($list);

      return $list;
  }

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

  $listOrderContainer.sortable({
    axis: 'x',
    tolerance: 'pointer',
    handle: '.title-wrapper',
    stop: function () {
      let listOrder = $listOrderContainer.sortable('toArray');
      localStorage.setItem('listOrder', JSON.stringify(listOrder));
    }
  });

  $(".job-sortable").sortable({
    placeholder: 'job-placeholder',
    connectWith: ".job-sortable",
    opacity: 0.8,
    start: function (e, ui) {
      ui.item.eq(0).toggleClass('is-dragging');
    },
    over: function(e,ui) {
      if (ui.sender) {
        let widget = ui.sender.data("ui-sortable");
        widget.scrollParent = $(this);
        widget.overflowOffset = $(this).offset();
      }
    },
    receive: function (e , ui) {
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
      localStorage.setItem('jobs', JSON.stringify(jobs));
    },
    stop: function (e, ui) {
      let $list = $(this).closest('.list-container');
      let $sortable = $list.children('.job-sortable').eq(0);

      lists[$list.attr('id')].order = $sortable.sortable('toArray');
      
      localStorage.setItem('lists', JSON.stringify(lists));
      ui.item.eq(0).toggleClass('is-dragging')
    }
  });

  $body.on('click', '.job-post', function(e) {

    $editJobId
      .val($(this).attr('id'));

    let { company, position, color, link, notes } = $(this).data('info');

    $editCompany
      .val(company);
    $editPosition
      .val(position);
    $editColor
      .val(color);
    $editLink
      .val(link);
    $editNotes
      .val(notes);

    $editForm.modal({
      showClose: false
    });

  });

  $body.on('click', '.job-post a', function (e) {
    e.stopPropagation();
  })

  $body.on('click', '.icon.trash', function(e) {
    e.stopPropagation();
    $deleteNotice.modal({
      showClose: false
    });
    let listId = $(this)
      .closest('.list-container')
        .eq(0)
        .attr('id');

    let jobId = $(this)
      .closest('.job-post')
        .eq(0)
        .attr('id');

    $deleteListId.val(listId);
    $deleteJobId.val(jobId);
  });

  $deleteButton.click(function (e) {
    e.preventDefault();
    let $job = $(`#${$deleteJobId.val()}`);
    let $list = $(`#${$deleteListId.val()}`);
    let $sortable = $list.children('.job-sortable').eq(0);

    $job.remove();
    delete jobs[$job.attr('id')];

    lists[$list.attr('id')].order = $sortable.sortable('toArray');
    localStorage.setItem('lists', JSON.stringify(lists));
    localStorage.setItem('jobs', JSON.stringify(jobs));
    $.modal.close();
  });

  $nevermindButton.click(function (e) {
    e.preventDefault();
    $.modal.close();
  });

  $body.on('click', '.add-job-button', function(e) {
    let listId = $(this)
      .closest('.list-container')
      .eq(0).attr('id');

    $addListId.val(listId);

    $addForm.modal({
      showClose: false
    });
    
  });

  $body.on('mouseenter', '.icon', function (e) {
    let color = $(this).closest('.job-post').css('background-color');
    $(this).css({
      color: color
    })
  });

  $body.on('mouseleave', '.icon', function (e) {
    $(this).css({
      color: 'white'
    });
  });

  $body.on('blur', '.list-title', function (e) {
    let title = $(this).val();
    let listId = $(this)
      .closest('.list-container')
        .children('.job-sortable')
        .eq(0).attr('id');

    lists[listId].title = title;
    localStorage.setItem('lists', JSON.stringify(lists)); 
  });

  $body.on('keypress', '.list-title', function (e) {
    let keycode = (event.keyCode ? event.keyCode : event.which);
    if (keycode == '13') $(this).blur();
  });

  $addForm.submit(function(e) {
    e.preventDefault();

    let listId = $addListId.val();
    let $sortable = $(`#${listId}`).children('.job-sortable').eq(0);

    let jobId = Date.now();
    let color = `rgb(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)})`;

    let company = $addCompany.val();
    if (!company) return;
    let position = $addPosition.val();
    let link = $addLink.val();

    let info = { company, color, position, link, time: jobId, notes: '' }
    
    let $jobPost = createJobPost(jobId, info);
    $sortable.append($jobPost);

    jobs[jobId] = info
    lists[listId].order = $sortable.sortable('toArray');
    localStorage.setItem('lists', JSON.stringify(lists));
    localStorage.setItem('jobs', JSON.stringify(jobs));

    $('.modal input').val('');

    $.modal.close();

  });

  $editForm.submit(function(e) {
    e.preventDefault();

    let color = $editColor.val();
    let company = $editCompany.val();
    let position = $editPosition.val();
    let link = $editLink.val()
    let id = $editJobId.val();
    let notes = $editNotes.val();

    if (!company) return;
    
    let changedInfo = { color, company, position, link, notes }
    jobs[id] = { ...jobs[id], ...changedInfo };

    let $newJobPost = createJobPost(id, jobs[id]);
    $(`#${id}`).replaceWith($newJobPost);

    localStorage.setItem('jobs', JSON.stringify(jobs));

    $.modal.close();
  });

  $newListButton.click(function () {
    let listId = Date.now();

    listOrder.push(listId);
    lists[listId] = {title: '', order: []};
    $listOrderContainer.append(createList(listId, ''));
    localStorage.setItem('listOrder', JSON.stringify(listOrder));
    localStorage.setItem('lists', JSON.stringify(lists));
  });

    
});