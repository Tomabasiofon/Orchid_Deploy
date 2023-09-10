import('nanoid').then((nanoid) => {
    // Now you can use nanoid as needed
    const generatedId = nanoid.nanoid(7);
    // Other code that uses nanoid
  }).catch((error) => {
    // Handle any errors that occur during the import
    console.error('Error importing nanoid:', error);
  });
  
const myNanoid = async() => {
    const nanoid = await import('nanoid');

    return nanoid
}