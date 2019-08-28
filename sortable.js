$(function() {

  let $deleteNotice = $('#delete-job-notice');
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
  let $editLink = $('#edit-link');

  let jobs = localStorage.getItem('jobs') ? 
  JSON.parse(localStorage.getItem('jobs')) : {}

  let lists = localStorage.getItem('lists') ? 
  JSON.parse(localStorage.getItem('lists')) : {
    applied: [],
    phone: [],
    onsite: [],
    offer: [],
    rejected: []
  }

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
    for (let key in lists) {

      createList(key);
      displayJobOrder(key);

    }

    $('.lists-display-container').append(`
      <div class='new-list-container'>
        <button class='new-list-button'>
          + Add a new list
        </button>
      </div>
    `)
  }

  displayLists();

  function displayJobOrder(list) {
    let order = lists[list];
    
    for (let id of order) {

      let jobInfo = jobs[id];
      let $jobPost = createJobPost(id, jobInfo);

      $(`#${list}`).append($jobPost);
    }; 
  }

  function createList(key) {
    let $list = $($('#list-template').html());

      $list
        .find('.title')
          .html(key.toUpperCase());

      $list
        .find('.job-sortable')
          .attr('id', key);

      $('.list-order-container').append($list);
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
          <div class="icon arrow">
            <i class="fas fa-arrow-right"></i>
          </div>
        </a>`
      )
    }

    return $jobPost
  }

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
      let newTime = Date.now()
      let $jobPost = ui.item;

      $jobPost
        .find('.time')
        .html(moment(newTime).fromNow());

      $jobPost.data().info.time = newTime;
      jobs[$jobPost.attr('id')].time = newTime;

      let receiverId = $(this).attr('id');

      lists[receiverId] = $(`#${receiverId}`).sortable('toArray');
      localStorage.setItem('jobs', JSON.stringify(jobs));
    },
    stop: function (e, ui) {
      let stopId = $(this).attr('id');
      lists[stopId] = $(`#${stopId}`).sortable('toArray');
      
      localStorage.setItem('lists', JSON.stringify(lists));
      ui.item.eq(0).toggleClass('is-dragging')
    }
  });

  $('body').on('click', '.job-post', function(e) {

    $editJobId
      .val($(this).attr('id'));

    let { company, position, color, link } = $(this).data('info');

    $editCompany
      .val(company);
    $editPosition
      .val(position);
    $editColor
      .val(color);
    $editLink
      .val(link)

    $editForm.modal({
      showClose: false
    });
  });

  $('body').on('click', '.job-post a', function (e) {
    e.stopPropagation();
  })

  $('body').on('click', '.icon.trash', function(e) {
    e.stopPropagation();
    $deleteNotice.modal({
      showClose: false
    });
    let sortableId = $(this)
      .closest('.job-sortable')
        .eq(0)
        .attr('id');

    let jobId = $(this)
      .closest('.job-post')
        .eq(0)
        .attr('id');

    $deleteListId.val(sortableId);
    $deleteJobId.val(jobId);
  });

  $deleteButton.click(function (e) {
    e.preventDefault();
    let $job = $(`#${$deleteJobId.val()}`);
    let sortableId = $deleteListId.val();

    $job.remove();
    delete jobs[$job.attr('id')];

    lists[sortableId] = $(`#${sortableId}`).sortable('toArray');
    localStorage.setItem('lists', JSON.stringify(lists));
    localStorage.setItem('jobs', JSON.stringify(jobs));
    $.modal.close();
  });

  $nevermindButton.click(function (e) {
    e.preventDefault();
    $.modal.close();
  });
    
  $('body').on('click', '.add-job-button', function(e) {
    let sortableId = $(this)
      .closest('.list-container')
      .children('.job-sortable')
        .eq(0).attr('id');

    $addListId.val(sortableId);

    $addForm.modal({
      showClose: false
    });
    
  });

  $('body').on('mouseenter', '.icon', function (e) {
    let color = $(this).closest('.job-post').css('background-color');
    $(this).css({
      color: color
    })
  });

  $('body').on('mouseleave', '.icon', function (e) {
    $(this).css({
      color: 'white'
    });
  })

  $addForm.submit(function(e) {

    e.preventDefault();

    let sortableId = $addListId.val();

    let jobId = Date.now();
    let color = `rgb(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)})`;

    let company = $addCompany.val();
    if (!company) return;
    let position = $addPosition.val();
    let link = $addLink.val();

    let info = { company, color, position, link, time: jobId }
    
    let $jobPost = createJobPost(jobId, info);
    $(`#${sortableId}`).append($jobPost);

    jobs[jobId] = info
    lists[sortableId] = $(`#${sortableId}`).sortable('toArray');
    localStorage.setItem('lists', JSON.stringify(lists));
    localStorage.setItem('jobs', JSON.stringify(jobs));

    $('input').val('');

    $.modal.close();

  });

  $editForm.submit(function(e) {
    e.preventDefault();

    let color = $editColor.val();
    let company = $editCompany.val();
    let position = $editPosition.val();
    let link = $editLink.val()
    let id = $editJobId.val();

    if (!company) return;
    
    let changedInfo = { color, company, position, link }
    jobs[id] = { ...jobs[id], ...changedInfo };

    let $newJobPost = createJobPost(id, jobs[id]);
    $(`#${id}`).replaceWith($newJobPost);

    localStorage.setItem('jobs', JSON.stringify(jobs));

    $.modal.close();
  });
    
});