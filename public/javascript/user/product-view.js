
document.addEventListener("DOMContentLoaded", function () {
    const mainImage = document.querySelector('.main-image');
    const img = document.getElementById('main-img');
    let zoomEnabled = false;
    let currentImageIndex = 0;

    const imgItems = Array.from(document.querySelectorAll('.img-item'));
    imgItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            setCurrentImage(index);
        });
    });

    mainImage.addEventListener('click', enableZoom);
    mainImage.addEventListener('mousemove', zoomIn);
    mainImage.addEventListener('mouseleave', zoomOut);

    function setCurrentImage(index) {
        currentImageIndex = index;
        const selectedImg = imgItems[index].querySelector('img');
        img.src = selectedImg.src;
        zoomEnabled = false;
        img.style.transform = 'scale(1)';
    }

    function enableZoom() {
        zoomEnabled = true;
    }

    function zoomIn(event) {
        if (!zoomEnabled) {
            return;
        }
        const boundingRect = mainImage.getBoundingClientRect();
        const mouseX = event.clientX - boundingRect.left;
        const mouseY = event.clientY - boundingRect.top;

        const offsetX = (mouseX / boundingRect.width) * 100;
        const offsetY = (mouseY / boundingRect.height) * 100;

        img.style.transformOrigin = `${offsetX}% ${offsetY}%`;
        img.style.transform = 'scale(2)';
    }
    function zoomOut() {
        img.style.transform = 'scale(1)';
        zoomEnabled = false;
    }

 
        // Add event listener to the "Rate this product" button
        document.getElementById('rateButton').addEventListener('click', function (event) {
            event.preventDefault(); // Prevent the button from submitting or navigating

            var bought = false; // Replace this with your logic to determine if the user has purchased the product

            if (bought) {
                window.location.href = '/addReview?id=<%= product._id %>';
            } else {
                Swal.fire({
                    icon: 'warning',
                    title: 'You need to purchase the product',
                    text: 'Please buy the product before rating.',
                });
            }
        });


})