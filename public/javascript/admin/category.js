


document.addEventListener('DOMContentLoaded', function () {
    function showUnlistConfirmation(categoryId, isListed) {
        const modal = new bootstrap.Modal(document.getElementById('unlistConfirmationModal'));
        const unlistConfirmationAction = document.getElementById('unlistConfirmationAction');
        const confirmationAction = document.getElementById('confirmationAction');
        confirmationAction.innerText = isListed ? 'list' : 'unlist';
        unlistConfirmationAction.href = isListed
            ? '/admin/category/unlist?id=' + categoryId
            : '/admin/category/unlist?id=' + categoryId;
        modal.show();
    }


    const editCategoryButton = document.querySelectorAll('.edit-category-button');
    const editCategoryForm = document.getElementById('editCategoryForm');
    const categoryIdInput = document.getElementById('categoryId');
    const newCategoryNameInput = document.getElementById('newCategoryName');

    editCategoryButton.forEach(function (button) {
        button.addEventListener('click', function () {
            const categoryId = button.getAttribute('data-category-id');
            categoryIdInput.value = categoryId;
        });
    });

    editCategoryForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const formData = new FormData(editCategoryForm);
        const url = editCategoryForm.getAttribute('action');
        fetch(url, {
            method: 'POST',
            body: formData
        })
            .then(response => {
                if (response.ok) {
                    $('#editCategoryModal').modal('hide');
                    location.reload();
                } else {
                }
            })
            .catch(error => {
            });
    });


    $(document).ready(function () {
        $('#submitBtn').on('click', function () {
            const selectedOffer = $("input[name='selectedOffer']:checked").val();
            console.log("Selected Offer:", selectedOffer);
            $('#offersModal').modal('hide');
        });
    });

    const openModalButton = document.querySelector('button[data-target="#offersModal"]');
    const categoryIdInput1 = document.getElementById('categoryIdO');

    openModalButton.addEventListener('click', function () {
        const categoryId = openModalButton.getAttribute('data-category-id');
        categoryIdInput1.value = categoryId;
    });
  
})