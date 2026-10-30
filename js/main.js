/* =========================================
   FOOD HUB RESTAURANT
   Main JavaScript
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    // 1. MOBILE NAVIGATION

    const menuToggle = document.querySelector(".menu-toggle");
    const navLinks = document.querySelector(".nav-links");

    if (menuToggle && navLinks) {
        menuToggle.addEventListener("click", () => {
            const isOpen = navLinks.classList.toggle("open");

            menuToggle.classList.toggle("active", isOpen);
            menuToggle.setAttribute("aria-expanded", String(isOpen));
        });

        navLinks.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                navLinks.classList.remove("open");
                menuToggle.classList.remove("active");
                menuToggle.setAttribute("aria-expanded", "false");
            });
        });

        document.addEventListener("click", event => {
            if (
                !menuToggle.contains(event.target) &&
                !navLinks.contains(event.target)
            ) {
                navLinks.classList.remove("open");
                menuToggle.classList.remove("active");
                menuToggle.setAttribute("aria-expanded", "false");
            }
        });
    }


    // 2. SCROLL REVEAL ANIMATION

    const revealElements = document.querySelectorAll(".reveal");

    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("show");
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.12
        });

        revealElements.forEach(element => {
            observer.observe(element);
        });
    } else {
        revealElements.forEach(element => {
            element.classList.add("show");
        });
    }


    // 3. MENU CATEGORY FILTER

    const filterButtons = document.querySelectorAll(".filter-btn");
    const foodCards = document.querySelectorAll(".menu-grid .food-card");

    filterButtons.forEach(button => {
        button.addEventListener("click", () => {

            filterButtons.forEach(btn => {
                btn.classList.remove("active");
            });

            button.classList.add("active");

            const selectedCategory = button.dataset.filter;

            foodCards.forEach(card => {
                const category = card.dataset.category;

                const shouldShow =
                    selectedCategory === "all" ||
                    selectedCategory === category;

                card.classList.toggle("hide", !shouldShow);

                if (shouldShow) {
                    card.style.animation = "none";
                    void card.offsetWidth;
                    card.style.animation = "cardEnter .4s ease both";
                }
            });
        });
    });


    // 4. SHOPPING CART

    let cart = [];

    try {
        cart = JSON.parse(localStorage.getItem("foodHubCart")) || [];

        if (!Array.isArray(cart)) {
            cart = [];
        }
    } catch {
        cart = [];
    }

    const cartCounts = document.querySelectorAll(".cart-count");
    const addButtons = document.querySelectorAll(".add-cart");

    const cartItemsElement = document.getElementById("cart-items");
    const cartTotalElement = document.getElementById("cart-total");

    // Coupon state
    let couponApplied = false;
    let discountAmount = 0;

    function getCartSubtotal() {
        return cart.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );
    }

    function saveCart() {
        try {
            localStorage.setItem("foodHubCart", JSON.stringify(cart));
        } catch {
            // Cart remains functional for the current page.
        }
    }

    function updateCart() {

        const totalItems = cart.reduce(
            (sum, item) => sum + item.quantity,
            0
        );

        const subtotal = getCartSubtotal();

        // Apply discount to the original subtotal only.
        const finalTotal = couponApplied
            ? Math.max(0, subtotal - discountAmount)
            : subtotal;

        cartCounts.forEach(counter => {
            counter.textContent = totalItems;
        });

        if (cartItemsElement) {
            cartItemsElement.textContent = totalItems;
        }

        if (cartTotalElement) {
            cartTotalElement.textContent = finalTotal.toFixed(2);
        }

        saveCart();

        // Update coupon discount when cart changes.
        if (couponApplied) {
            discountAmount = subtotal * 0.50;

            if (cartTotalElement) {
                cartTotalElement.textContent =
                    (subtotal - discountAmount).toFixed(2);
            }
        }
    }

    addButtons.forEach(button => {
        button.addEventListener("click", () => {

            const name = button.dataset.name;
            const price = Number(button.dataset.price);

            if (!name || !Number.isFinite(price) || price <= 0) {
                return;
            }

            const existingItem = cart.find(
                item => item.name === name
            );

            if (existingItem) {
                existingItem.quantity++;
            } else {
                cart.push({
                    name: name,
                    price: price,
                    quantity: 1
                });
            }

            updateCart();

            const originalText = "Add to Cart +";

            button.textContent = "Added ✓";
            button.style.background = "#238449";
            button.style.color = "#fff";

            setTimeout(() => {
                button.textContent = originalText;
                button.style.background = "";
                button.style.color = "";
            }, 1000);
        });
    });

    updateCart();


    // 5. VIEW CART

    const viewCartButton = document.getElementById("view-cart");

    if (viewCartButton) {
        viewCartButton.addEventListener("click", () => {

            if (cart.length === 0) {
                alert("Your cart is empty. Add some delicious food first!");
                return;
            }

            let message = "YOUR FOOD HUB ORDER\n\n";

            cart.forEach(item => {
                message += `${item.name} x ${item.quantity} = ₹${item.price * item.quantity}\n`;
            });

            const subtotal = getCartSubtotal();
            const discount = couponApplied ? subtotal * 0.50 : 0;
            const finalTotal = subtotal - discount;

            message += `\nSUBTOTAL: ₹${subtotal.toFixed(2)}`;

            if (couponApplied) {
                message += `\nWED50 DISCOUNT: -₹${discount.toFixed(2)}`;
            }

            message += `\nTOTAL: ₹${finalTotal.toFixed(2)}`;

            message += "\n\nThis is a demo cart. Online checkout is not connected.";

            alert(message);
        });
    }


    // 6. WED50 COUPON SYSTEM

    const couponInput = document.getElementById("coupon-code");
    const deliveryCheckbox = document.getElementById("delivery-order");
    const applyCouponButton = document.getElementById("apply-coupon");
    const couponMessage = document.getElementById("coupon-message");

    function showCouponMessage(message, type) {
        if (!couponMessage) return;

        couponMessage.textContent = message;
        couponMessage.className = type;
    }

    if (applyCouponButton && couponInput && deliveryCheckbox) {

        applyCouponButton.addEventListener("click", () => {

            const couponCode = couponInput.value.trim().toUpperCase();

            // Check if coupon is already applied.
            if (couponApplied) {
                showCouponMessage(
                    "WED50 is already applied to your cart.",
                    "success"
                );
                return;
            }

            // Check coupon code.
            if (couponCode !== "WED50") {
                showCouponMessage(
                    "Invalid coupon code. Please enter WED50.",
                    "error"
                );
                return;
            }

            // Check Wednesday.
            const today = new Date().getDay();

            if (today !== 3) {
                showCouponMessage(
                    "Sorry! WED50 coupon is valid only on Wednesdays.",
                    "error"
                );
                return;
            }

            // Check delivery order.
            if (!deliveryCheckbox.checked) {
                showCouponMessage(
                    "This coupon is valid only for delivery orders.",
                    "error"
                );
                return;
            }

            // Check first-time customer.
            let hasOrderedBefore = false;

            try {
                hasOrderedBefore =
                    localStorage.getItem("foodHubHasOrdered") === "true";
            } catch {
                // Storage unavailable.
            }

            if (hasOrderedBefore) {
                showCouponMessage(
                    "Sorry! This coupon is available only for first-time customers.",
                    "error"
                );
                return;
            }

            // Check usage limit.
            let couponUses = 0;

            try {
                couponUses = Number(
                    localStorage.getItem("foodHubWED50Uses") || 0
                );
            } catch {
                couponUses = 0;
            }

            if (couponUses >= 3) {
                showCouponMessage(
                    "You have reached the maximum coupon usage limit.",
                    "error"
                );
                return;
            }

            // Check cart.
            const subtotal = getCartSubtotal();

            if (subtotal <= 0) {
                showCouponMessage(
                    "Please add some food to your cart before applying the coupon.",
                    "error"
                );
                return;
            }

            // Apply 50% discount.
            couponApplied = true;
            discountAmount = subtotal * 0.50;

            try {
                localStorage.setItem(
                    "foodHubWED50Uses",
                    String(couponUses + 1)
                );
            } catch {
                // Coupon works for the current page session.
            }

            updateCart();

            showCouponMessage(
                "Congratulations! 50% discount applied successfully.",
                "success"
            );

            couponInput.disabled = true;
            applyCouponButton.disabled = true;
        });
    }


    // 7. RESERVATION FORM

    const reservationForm = document.getElementById("reservation-form");
    const bookingDate = document.getElementById("booking-date");
    const formMessage = document.getElementById("form-message");

    if (bookingDate) {

        const today = new Date();

        const localDate = [
            today.getFullYear(),
            String(today.getMonth() + 1).padStart(2, "0"),
            String(today.getDate()).padStart(2, "0")
        ].join("-");

        bookingDate.min = localDate;
    }

    if (reservationForm) {

        reservationForm.addEventListener("submit", event => {

            event.preventDefault();

            if (!reservationForm.checkValidity()) {
                reservationForm.reportValidity();
                return;
            }

            const name = document.getElementById("guest-name").value.trim();
            const email = document.getElementById("guest-email").value.trim();
            const date = bookingDate.value;

            if (name.length < 2) {
                showMessage("Please enter a valid name.", "error");
                return;
            }

            if (!email) {
                showMessage("Please enter your email address.", "error");
                return;
            }

            if (date < bookingDate.min) {
                showMessage("Please select today or a future date.", "error");
                return;
            }

            showMessage(
                `Thank you, ${name}! Your demo reservation request is ready. Connect a backend to submit it to the restaurant.`,
                "success"
            );

            reservationForm.reset();
            bookingDate.min = localDate;
        });
    }

    function showMessage(message, type) {
        if (!formMessage) return;

        formMessage.textContent = message;
        formMessage.className = "form-message " + type;
    }

});