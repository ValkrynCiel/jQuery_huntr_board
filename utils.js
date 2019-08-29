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

/** recursive setTimeout call to update time displays each minute since
 * text updates once a minute
 */
function updateTimeDisplay () {
  $('.job-post').each(function () {
    $(this)
      .find('.time')
      .html(moment($(this).data().info.time).fromNow())
  });
  setTimeout(updateTimeDisplay, 60000);
}