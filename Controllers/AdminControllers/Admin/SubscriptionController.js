const Subscription = require("../../../Models/Subscription");
const User = require('../../../Models/userModel');

module.exports = {

	allSubscription: async (req, res) => {
		const Subscriptions = await Subscription.find().sort({ createdAt: -1 });
		return res.render('Subscriptions', {
			allSubscriptions: Subscriptions,
			success: req.flash("success"),
			error: req.flash("error"),
		});
	},

	oneSubscription: async (req, res) => {
		try {
			const subscriptionId = req.params.subscriptionId;
			const subscription = await Subscription.findById(subscriptionId);
			
			
			if (!subscription) {
				req.flash("error", "Subscription not found");
				return res.redirect('/admin/subscriptions');

			}

			const users = await User.find({ subscriptionId: subscriptionId }).select('name email phone');

			return res.render("viewSubscription", {
				Subscription: subscription,
				Users: users,
				success: req.flash("success"),
				error: req.flash("error") 
			});
		}
		catch (error) {
			console.log(error);
			req.flash("error", "Internal server error");
			return res.redirect("/admin/dashboard");
		}
	},

	addSubscription: async (req, res) => {
		try {
			const { name, price, discount, status, days } = req.body;
			// const iconFile = req.files.iconFile;
			// const extension = iconFile.name.split('.').pop();
			// const filename = `${Date.now()}.${extension}`;
			// const fileContent = iconFile.data;

			// const params = {
			// 	Bucket: "yaarish",
			// 	Key: filename,
			// 	Body: fileContent,
			// 	ContentType: iconFile.mimetype
			// };

			// await s3.upload(params).promise();
			const subscription = await Subscription.create({ name, price, discount, status, days });
			if (!subscription) {
				req.flash('error', "error while creating subscription");
				return res.redriect('/admin/subscription');
			}
			req.flash('success', "Subscription added successfully");
			return res.redirect('/admin/subscription');
		} catch (error) {
			//console.log(error);
			req.flash('error', "Internal server error");
			return res.redirect('/admin/subscription');
		}
	},




	update: async (req, res) => {
		try {
			const subscriptionId = req.params.id;
			const { name, price,days, discount, status } = req.body;
			console.log(days);

			if (!subscriptionId) {
				req.flash('error', "Invalid subscription Id");
				return res.redirect('/admin/subscription');

			}
			const subscription = await Subscription.findById(subscriptionId);

			if (!subscription) {
				req.flash('error', "error while creating subscription");
				return res.redirect('/admin/subscription');

			}

			subscription.name = name || subscription.name;
			subscription.price = price || subscription.price;
			subscription.days = days || subscription.days;
			subscription.discount = discount || subscription.discount;
			subscription.status = status || subscription.status;

			await subscription.save();

			req.flash('success', "Subscription updated successfully");
			return res.redirect(`/admin/subscriptions/${subscriptionId}`);


		} catch (error) {
			//console.log(error);
			req.flash("error", "Internal server error");
			return res.redirect("/admin/subscription");
		}


	},



	delete: async (req, res) => {
		try {
			const id = req.params.id;


			const subscription = await Subscription.findById(id);

			if (!subscription) {
				req.flash("error", "subscription not found");
				return res.redirect("/admin/subscription");

			}
			await Subscription.findByIdAndDelete(id);
			req.flash("success", "Subscription successfully deleted");
			return res.redirect("/admin/subscription");
		} catch (error) {
			//console.log(error);
			req.flash("error", "Internal server error");
			return res.redirect("/admin/subscription");
		}
	}


}