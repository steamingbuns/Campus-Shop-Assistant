import { Link } from 'react-router-dom';
import styles from './Home.module.css';

function Home() {
  return (
    <div className={styles.homeWrapper}>
      <div className={styles.heroFrame}>
        <section className={styles.homeContainer}>
        <div className={styles.heroContent}>
          <h1>Welcome to Campus Shop Assistant</h1>
          <p>
            Discover and trade essentials with fellow students. Our marketplace keeps
            everything on campus, so you can quickly pick up books, tech, or dorm needs
            without leaving the quad.
          </p>

          <div className={styles.heroActions}>
            <Link to="/marketplace" className={styles.ctaPrimary}>Explore Marketplace</Link>
            <Link to="/signup" className={styles.ctaSecondary}>Become a Seller</Link>
          </div>
        </div>

        <div className={styles.quickGuide}>
          <h2>How to get started</h2>
          <ol>
            <li>Create an account or log in with your campus email.</li>
            <li>Browse the marketplace to add items to your cart or wishlist.</li>
            <li>Head to checkout to finalize purchases or open the seller dashboard to list your own items.</li>
          </ol>
          <p className={styles.tip}>
            Tip: Keep an eye on the cart icon in the header to track items while you explore.
          </p>
        </div>
        </section>
      </div>
    </div>
  );
}

export default Home;