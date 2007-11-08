
package chickenfoot.experimental;

import junit.framework.TestCase;

/**
 * StringMetricsTest is a test of the editDistance() implementation.
 *
 * @author mbolin
 */
public class StringMetricsTest extends TestCase {

    public void testEditDistance() {
        assertEquals(StringMetrics.editDistance("MIT", "MIT"), 0);
        assertEquals(StringMetrics.editDistance("survey", "surgery"), 2);
        
        assertEquals(StringMetrics.editDistance("p", "abcdefghijklmno"), 1);
    }
    
}
