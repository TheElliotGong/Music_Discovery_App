const sendPost = async (url, data, handler) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  //Hide the error message if it is showing
  if (document.querySelector('.warning')) {
   hideError();
  }

  //Redirect to the page if the server requests it.
  if (result.redirect) {
    window.location = result.redirect;
  }
  //Show an error message if the server sends one.
  if (result.error) {
    handleError(result.error);
  }
  //Call the handler function if the server sends one.
  if (handler) {
    handler(result);
  }
};

module.exports